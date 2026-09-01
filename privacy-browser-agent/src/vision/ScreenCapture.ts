/**
 * ScreenCapture.ts
 * Captures the visible tab securely using extension APIs.
 */

export async function captureVisibleTab(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Requires "activeTab" permission in manifest
    chrome.tabs.captureVisibleTab(
      chrome.windows.WINDOW_ID_CURRENT,
      { format: "png", quality: 100 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (dataUrl) {
          resolve(dataUrl);
        } else {
          reject(new Error("Failed to capture screen"));
        }
      }
    );
  });
}

/**
 * Convert base64 dataUrl to an ImageData object.
 * We draw the dataURL onto an OffscreenCanvas to extract ImageData,
 * which is needed for Transformers.js inference.
 */
export async function dataUrlToImageData(dataUrl: string): Promise<ImageData> {
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);
  
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");
  
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  
  // Clean up memory
  bitmap.close();
  
  return imageData;
}
