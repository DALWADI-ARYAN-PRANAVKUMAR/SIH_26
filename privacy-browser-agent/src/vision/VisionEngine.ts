/**
 * VisionEngine.ts
 * Main thread orchestrator for local visual perception.
 */
import { captureVisibleTab, dataUrlToImageData } from "./ScreenCapture";
import type { VisualContext } from "./VisualContext";

// Singleton worker instance
let worker: Worker | null = null;

// Create the worker
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./VisionWorker.ts", import.meta.url), { type: "module" });
    worker.postMessage({ type: "init" });
  }
  return worker;
}

export async function runVisionPipeline(): Promise<VisualContext> {
  const w = getWorker();
  
  return new Promise(async (resolve, reject) => {
    let dataUrl: string;
    let imageData: ImageData;
    try {
      dataUrl = await captureVisibleTab();
      imageData = await dataUrlToImageData(dataUrl);
    } catch (e) {
      return reject(e);
    }

    const onMessage = (e: MessageEvent) => {
      const { type, message, error, ocr, elements } = e.data;
      if (type === "status") {
        console.log("[VisionEngine]", message);
      } else if (type === "error") {
        w.removeEventListener("message", onMessage);
        reject(new Error(error));
      } else if (type === "result") {
        w.removeEventListener("message", onMessage);
        resolve({
          viewport: {
            width: imageData.width,
            height: imageData.height
          },
          ocr,
          elements,
          redactions: [],
          timestamp: Date.now()
        });
      }
    };

    w.addEventListener("message", onMessage);
    
    w.postMessage({
      type: "inference",
      imageData,
      width: imageData.width,
      height: imageData.height
    });
  });
}
