/// <reference lib="webworker" />

import { heicTo } from "heic-to/next";

import {
  detectImageFormatFromBytes,
  MAX_CONVERSION_FILE_BYTES,
  OUTPUT_MIME_TYPES,
  type OutputMimeType,
  type SourceImageFormat,
  validateStaticImage,
  validateSvgText,
} from "@/lib/image-format";

const MAX_PIXELS = 40_000_000;
const LOSSY_QUALITY = 0.92;

type ConversionRequest = {
  file: File;
  outputMimeType: OutputMimeType;
};

class WorkerConversionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = async (event: MessageEvent<ConversionRequest>) => {
  try {
    const result = await convertImage(event.data.file, event.data.outputMimeType);
    workerScope.postMessage({ type: "success", ...result });
  } catch (error) {
    const failure =
      error instanceof WorkerConversionError
        ? error
        : new WorkerConversionError(
            "CONVERSION_ERROR",
            error instanceof Error
              ? error.message
              : "Image conversion failed with an unknown error.",
          );
    workerScope.postMessage({
      type: "error",
      code: failure.code,
      message: failure.message,
    });
  }
};

async function convertImage(file: File, outputMimeType: OutputMimeType) {
  validateRequest(file, outputMimeType);

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const sourceFormat = detectImageFormatFromBytes(sourceBytes);
  if (!sourceFormat) {
    throw new WorkerConversionError(
      "UNSUPPORTED_FORMAT",
      `Unsupported image format. Expected JPG, PNG, WebP, SVG, HEIC, or HEIF; received ${file.type || "an unknown format"}.`,
    );
  }

  validateStaticImage(sourceBytes, sourceFormat);
  if (sourceFormat === "SVG") validateSvgText(new TextDecoder().decode(sourceBytes));

  const sourceImage = await decodeSource(file, sourceFormat);
  const sourcePixels = sourceImage.width * sourceImage.height;
  if (sourceImage.width <= 0 || sourceImage.height <= 0) {
    sourceImage.close();
    throw new WorkerConversionError(
      "INVALID_DIMENSIONS",
      `The image dimensions are invalid. Expected positive width and height; received ${sourceImage.width} × ${sourceImage.height}.`,
    );
  }
  if (sourcePixels > MAX_PIXELS) {
    const dimensions = `${sourceImage.width} × ${sourceImage.height}`;
    sourceImage.close();
    throw new WorkerConversionError(
      "TOO_MANY_PIXELS",
      `The image is too large to process safely. Expected 40 megapixels or less; received ${(sourcePixels / 1_000_000).toFixed(1)} megapixels (${dimensions}).`,
    );
  }

  try {
    const canvas = renderSource(sourceImage, outputMimeType);
    const blob = await encodeCanvas(canvas, outputMimeType);
    await verifyOutput(blob, outputMimeType, sourceImage.width, sourceImage.height);
    return {
      blob,
      width: sourceImage.width,
      height: sourceImage.height,
      sourceFormat,
      outputMimeType,
    };
  } finally {
    sourceImage.close();
  }
}

function validateRequest(file: File, outputMimeType: OutputMimeType) {
  if (file.size <= 0 || file.size > MAX_CONVERSION_FILE_BYTES) {
    throw new WorkerConversionError(
      "INVALID_FILE_SIZE",
      `Invalid source size. Expected more than 0 bytes and no more than 50MB; received ${file.size} bytes.`,
    );
  }
  if (!OUTPUT_MIME_TYPES.includes(outputMimeType)) {
    throw new WorkerConversionError(
      "INVALID_OUTPUT_FORMAT",
      `Unsupported output format. Expected image/jpeg, image/png, or image/webp; received ${outputMimeType}.`,
    );
  }
}

async function decodeSource(file: File, sourceFormat: SourceImageFormat) {
  if (sourceFormat === "HEIC" || sourceFormat === "HEIF") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      return heicTo({
        blob: file,
        type: "bitmap",
        options: { imageOrientation: "from-image" },
      });
    }
  }

  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (error) {
    throw new WorkerConversionError(
      "DECODE_ERROR",
      `The ${sourceFormat} image could not be decoded. Expected a valid static image; received ${error instanceof Error ? error.message : "an unreadable file"}.`,
    );
  }
}

function renderSource(sourceImage: ImageBitmap, outputMimeType: OutputMimeType) {
  const canvas = new OffscreenCanvas(sourceImage.width, sourceImage.height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new WorkerConversionError(
      "CANVAS_UNAVAILABLE",
      "This browser could not create an image canvas. Expected a 2D canvas context; received null.",
    );
  }

  if (outputMimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(sourceImage, 0, 0);
  return canvas;
}

async function encodeCanvas(canvas: OffscreenCanvas, outputMimeType: OutputMimeType) {
  const blob = await canvas.convertToBlob({
    type: outputMimeType,
    quality: outputMimeType === "image/png" ? undefined : LOSSY_QUALITY,
  });
  if (blob.type !== outputMimeType) {
    throw new WorkerConversionError(
      "ENCODER_UNAVAILABLE",
      `This browser cannot encode the selected format locally. Expected ${outputMimeType}; received ${blob.type || "an unknown output type"}.`,
    );
  }
  if (blob.size <= 0) {
    throw new WorkerConversionError(
      "EMPTY_OUTPUT",
      "The browser encoder returned an empty image. Expected more than 0 bytes; received 0 bytes.",
    );
  }
  return blob;
}

async function verifyOutput(
  blob: Blob,
  outputMimeType: OutputMimeType,
  expectedWidth: number,
  expectedHeight: number,
) {
  const bytes = new Uint8Array(await blob.slice(0, 65_536).arrayBuffer());
  const outputFormat = detectImageFormatFromBytes(bytes);
  const expectedFormat =
    outputMimeType === "image/jpeg"
      ? "JPG"
      : outputMimeType === "image/png"
        ? "PNG"
        : "WebP";
  if (outputFormat !== expectedFormat) {
    throw new WorkerConversionError(
      "OUTPUT_FORMAT_MISMATCH",
      `Output verification failed. Expected ${expectedFormat}; received ${outputFormat || "an unknown format"}.`,
    );
  }

  const decodedOutput = await createImageBitmap(blob);
  if (decodedOutput.width !== expectedWidth || decodedOutput.height !== expectedHeight) {
    const actualDimensions = `${decodedOutput.width} × ${decodedOutput.height}`;
    decodedOutput.close();
    throw new WorkerConversionError(
      "OUTPUT_DIMENSIONS_MISMATCH",
      `Output verification failed. Expected ${expectedWidth} × ${expectedHeight}; received ${actualDimensions}.`,
    );
  }
  decodedOutput.close();
}
