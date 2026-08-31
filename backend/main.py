import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI(title="Privacy Agent Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a browser extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LLM Client setup
API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if API_KEY and API_KEY != "your_gemini_api_key_here":
    client = genai.Client(api_key=API_KEY)

class ChatRequest(BaseModel):
    message: str
    pageContext: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    confidence: float

SYSTEM_PROMPT = """You are a browser page understanding assistant.

You receive structured information extracted from the user's CURRENT webpage.
Use only the supplied page context when answering questions about the page.

Do not invent buttons, fields, links, content, or actions that are not present in the provided context.
If information is missing, explicitly say that it is unavailable.
Never expose passwords or sensitive values.

The current phase is informational only.
Do not claim that you performed an action.
Do not generate autonomous browser actions yet.
"""

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not client:
        return ChatResponse(
            reply="⚠️ Backend is running, but no GEMINI_API_KEY was found in .env.",
            confidence=1.0
        )
    
    # Construct prompt
    user_prompt = f"User asked: {request.message}\n\n"
    if request.pageContext:
        user_prompt += f"=== CURRENT PAGE CONTEXT ===\n"
        user_prompt += f"URL: {request.pageContext.get('page', {}).get('url')}\n"
        user_prompt += f"Title: {request.pageContext.get('page', {}).get('title')}\n"
        user_prompt += f"\n--- HEADINGS ---\n"
        for h in request.pageContext.get('headings', []):
            user_prompt += f"H{h.get('level')}: {h.get('text')}\n"
        
        user_prompt += f"\n--- TEXT CHUNKS ---\n"
        for i, t in enumerate(request.pageContext.get('text', [])[:10]): # Limit text chunks for speed
            user_prompt += f"{i+1}. {t}\n"
        if len(request.pageContext.get('text', [])) > 10:
            user_prompt += "...(truncated)\n"
            
        user_prompt += f"\n--- INTERACTIVE ELEMENTS ---\n"
        elements = request.pageContext.get('elements', {})
        
        buttons = elements.get('buttons', [])
        if buttons:
            user_prompt += f"Buttons ({len(buttons)}):\n"
            for b in buttons[:20]:
                user_prompt += f"- [{b.get('id')}] {b.get('text')} {b.get('ariaLabel', '')}\n"
                
        inputs = elements.get('inputs', [])
        if inputs:
            user_prompt += f"Inputs ({len(inputs)}):\n"
            for i in inputs[:20]:
                user_prompt += f"- [{i.get('id')}] type={i.get('inputType')} name={i.get('name', '')} placeholder={i.get('placeholder', '')}\n"
                
        forms = elements.get('forms', [])
        if forms:
            user_prompt += f"Forms ({len(forms)}):\n"
            for f in forms:
                user_prompt += f"- [{f.get('id')}] name={f.get('name', '')}\n"
                
        links = elements.get('links', [])
        if links:
            user_prompt += f"Links ({len(links)}):\n"
            for l in links[:20]:
                user_prompt += f"- [{l.get('id')}] {l.get('text')}\n"
                
        user_prompt += "\n============================\n"
    else:
        user_prompt += "(No page context was provided.)\n"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{SYSTEM_PROMPT}\n\n{user_prompt}",
        )
        return ChatResponse(reply=response.text, confidence=0.9)
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return ChatResponse(
            reply=f"⚠️ Sorry, I encountered an error communicating with the AI model: {str(e)}",
            confidence=0.0
        )

import json

class PlanRequest(BaseModel):
    task: str
    pageContext: Dict[str, Any]

class ActionPlan(BaseModel):
    type: str = "action_plan"
    message: str
    actions: List[Dict[str, Any]]
    requiresConfirmation: bool = False

PLANNER_SYSTEM_PROMPT = """You are a browser task planning model.

You receive:
1. User task
2. Current structured webpage context

Your job is to produce a strictly structured action plan.

Rules:
- Use only available element IDs from the context.
- Never invent element IDs.
- Never invent page elements.
- Do not output JavaScript.
- Do not output arbitrary code.
- Prefer one or a small number of actions at a time.
- If the page state is insufficient, request re-observation/replanning by returning no actions.
- High-risk operations must require user confirmation (requiresConfirmation: true).

PRIVACY RULES (CRITICAL):
- Redacted values are intentionally unavailable (e.g. [EMAIL], [PASSWORD], [CARD], [PERSON]). 
- Do not infer, reconstruct, guess, or request the original sensitive value. 
- Treat placeholders as opaque semantic entities. You can type these placeholders literally if requested to fill a field, but usually you should just type what the user asked in their prompt.
- Do not expose passwords.

Return ONLY valid JSON matching this schema:
{
  "type": "action_plan",
  "message": "What you are about to do",
  "actions": [
    { "action": "type", "target": { "elementId": "input_001" }, "value": "text" },
    { "action": "click", "target": { "elementId": "button_002" } }
  ],
  "requiresConfirmation": false
}
"""

@app.post("/api/agent/plan", response_model=ActionPlan)
async def plan_endpoint(request: PlanRequest):
    if not client:
        raise HTTPException(status_code=500, detail="LLM not configured")

    user_prompt = f"User Task: {request.task}\n\n=== PAGE CONTEXT ===\n{json.dumps(request.pageContext, indent=2)}"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{PLANNER_SYSTEM_PROMPT}\n\n{user_prompt}",
        )
        
        # Parse JSON from response
        # Gemini might wrap in ```json ... ```
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        data = json.loads(text)
        return ActionPlan(**data)
    except Exception as e:
        print(f"Error calling LLM for plan: {e}")
        return ActionPlan(
            message=f"I encountered an error while planning: {str(e)}",
            actions=[],
            requiresConfirmation=False
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
