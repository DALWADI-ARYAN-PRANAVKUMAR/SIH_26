/**
 * VisualRedactor.ts
 * Actually paints over the raw screenshot using the detected redactions,
 * guaranteeing the server only receives a pixel-censored image.
 */

import { VisualContext, SanitizedVisualContext } from "../vision/VisualContext";

export async function redactScreenshot(
  dataUrl: string,
  context: VisualContext
): Promise<SanitizedVisualContext> {
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);
  
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context for redaction");
  }

  // Draw the original image
  ctx.drawImage(bitmap, 0, 0);

  // Apply redaction boxes
  ctx.fillStyle = "black";
  for (const redaction of context.redactions) {
    ctx.fillRect(
      redaction.bbox.x,
      redaction.bbox.y,
      redaction.bbox.width,
      redaction.bbox.height
    );
  }

  // Convert back to base64
  const sanitizedBlob = await canvas.convertToBlob({ type: "image/png" });
  
  const sanitizedBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(sanitizedBlob);
  });
  
  bitmap.close();

  return {
    ...context,
    sanitizedScreenshotBase64: sanitizedBase64
  };
}
