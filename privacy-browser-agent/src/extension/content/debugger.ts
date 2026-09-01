export function drawDebugBoxes(boxes: any[]) {
  let canvas = document.getElementById("privacy-agent-debug-canvas") as HTMLCanvasElement;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "privacy-agent-debug-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999999";
    document.body.appendChild(canvas);
  }
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const box of boxes) {
    ctx.strokeStyle = box.color || "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.bbox.x, box.bbox.y, box.bbox.width, box.bbox.height);
    if (box.label) {
      ctx.fillStyle = box.color || "red";
      ctx.font = "14px Arial";
      ctx.fillText(box.label, box.bbox.x, box.bbox.y - 5);
    }
  }
}
