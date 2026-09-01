/**
 * VisionWorker.ts
 * Web Worker for running on-device Vision Models and OCR.
 */

import { pipeline, env } from "@huggingface/transformers";
import Tesseract from "tesseract.js";

// Configure transformers.js for browser environment
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

let objectDetector: any = null;
let isLoaded = false;

async function loadModels() {
  if (isLoaded) return;
  
  self.postMessage({ type: "status", message: "Loading object detection model..." });
  
  // Use a tiny object detection model for speed
  objectDetector = await pipeline("object-detection", "Xenova/yolos-tiny", {
    device: "webgpu", // Try WebGPU first
  }).catch(async (e) => {
    self.postMessage({ type: "status", message: "WebGPU unavailable, falling back to WASM..." });
    return await pipeline("object-detection", "Xenova/yolos-tiny", {
      device: "wasm",
    });
  });

  isLoaded = true;
  self.postMessage({ type: "status", message: "Models ready." });
  self.postMessage({ type: "ready" });
}

async function runInference(imageData: ImageData, width: number, height: number) {
  if (!isLoaded) await loadModels();

  self.postMessage({ type: "status", message: "Running OCR..." });
  
  // 1. Run OCR via Tesseract.js (WASM)
  // We need to convert ImageData back to a format Tesseract likes, or just pass the image.
  // Actually, Tesseract.recognize accepts image URLs or canvas elements.
  // Since we are in a worker, we can draw the ImageData to an OffscreenCanvas and pass the blob/canvas.
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx?.putImageData(imageData, 0, 0);
  
  // Tesseract accepts OffscreenCanvas in v4+
  const ocrResult = await Tesseract.recognize(canvas, 'eng', {
    logger: m => console.log(m)
  });

  const ocrBlocks = ocrResult.data.words.map(w => ({
    text: w.text,
    bbox: {
      x: w.bbox.x0,
      y: w.bbox.y0,
      width: w.bbox.x1 - w.bbox.x0,
      height: w.bbox.y1 - w.bbox.y0
    },
    confidence: w.confidence / 100 // Tesseract returns 0-100
  }));

  self.postMessage({ type: "status", message: "Running Object Detection..." });
  
  // 2. Run Object Detection via Transformers.js
  // Create a canvas URL or use raw pixel data. Transformers.js accepts Canvas or raw image url.
  const blob = await canvas.convertToBlob({ type: "image/png" });
  const imageUrl = URL.createObjectURL(blob);
  
  const detectOutput = await objectDetector(imageUrl, {
    threshold: 0.3,
  });
  
  URL.revokeObjectURL(imageUrl);

  const objects = detectOutput.map((d: any, i: number) => ({
    id: `visual_obj_${i}`,
    type: d.label,
    bbox: {
      x: d.box.xmin,
      y: d.box.ymin,
      width: d.box.xmax - d.box.xmin,
      height: d.box.ymax - d.box.ymin
    },
    confidence: d.score
  }));

  self.postMessage({
    type: "result",
    ocr: ocrBlocks,
    elements: objects
  });
}

self.onmessage = async (e) => {
  const { type, imageData, width, height } = e.data;

  try {
    if (type === "init") {
      await loadModels();
    } else if (type === "inference") {
      await runInference(imageData, width, height);
    }
  } catch (err: any) {
    self.postMessage({ type: "error", error: err.message });
  }
};
