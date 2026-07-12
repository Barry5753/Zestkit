import {
  detectImageFormat,
  getOutputExtension,
  prepareSvgBlob,
  type OutputMimeType,
  type SourceImageFormat,
} from "@/lib/image-format";

const MAX_CONVERSION_PIXELS = 40_000_000;
const LOSSY_QUALITY = 0.92;

export type ConversionSuccess = {
  blob: Blob;
  width: number;
  height: number;
  sourceFormat: SourceImageFormat;
  outputMimeType: OutputMimeType;
};

type ConversionWorkerSuccess = ConversionSuccess & { type: "success" };
type ConversionWorkerFailure = { type: "error"; code: string; message: string };
type ConversionWorkerMessage = ConversionWorkerSuccess | ConversionWorkerFailure;

export class ConversionError extends Error {
  code: string;

  constructor(failure: ConversionWorkerFailure) {
    super(failure.message);
    this.name = "ConversionError";
    this.code = failure.code;
  }
}

export async function validateConversionFile(file: File) {
  return detectImageFormat(file);
}

export function buildConvertedName(sourceName: string, outputMimeType: OutputMimeType) {
  const baseName = sourceName.replace(/\.[^.]+$/, "") || "converted-image";
  return `${baseName}-converted.${getOutputExtension(outputMimeType)}`;
}

export function startConversion(
  file: File,
  outputMimeType: OutputMimeType,
  sourceFormat: SourceImageFormat,
) {
  if (sourceFormat === "SVG") return startSvgConversion(file, outputMimeType);

  const worker = new Worker(
    new URL("../workers/convert-image.worker.ts", import.meta.url),
    { type: "module" },
  );

  let settled = false;
  let rejectJob: (error: Error) => void = () => undefined;

  const promise = new Promise<ConversionSuccess>((resolve, reject) => {
    rejectJob = reject;

    worker.onmessage = (event: MessageEvent<ConversionWorkerMessage>) => {
      settled = true;
      worker.terminate();

      if (event.data.type === "success") {
        resolve(event.data);
        return;
      }
      reject(new ConversionError(event.data));
    };

    worker.onerror = (event) => {
      settled = true;
      worker.terminate();
      reject(
        new ConversionError({
          type: "error",
          code: "WORKER_ERROR",
          message: `The browser conversion worker stopped unexpectedly. Expected a converted image; received ${event.message || "an unknown worker error"}.`,
        }),
      );
    };

    worker.postMessage({ file, outputMimeType });
  });

  return {
    promise,
    cancel() {
      if (settled) return;
      settled = true;
      worker.terminate();
      rejectJob(new DOMException("Conversion was cancelled.", "AbortError"));
    },
  };
}

function startSvgConversion(file: File, outputMimeType: OutputMimeType) {
  let settled = false;
  let imageUrl = "";
  let image: HTMLImageElement | null = null;
  let rejectJob: (error: Error) => void = () => undefined;

  const promise = new Promise<ConversionSuccess>((resolve, reject) => {
    rejectJob = reject;
    void prepareSvgBlob(file).then((svgBlob) => {
      if (settled) return;

      imageUrl = URL.createObjectURL(svgBlob);
      image = new window.Image();
      image.onload = () => {
        if (settled || !image) return;

        const width = image.naturalWidth;
        const height = image.naturalHeight;
        const pixels = width * height;
        if (width <= 0 || height <= 0) {
          settled = true;
          URL.revokeObjectURL(imageUrl);
          reject(
            new Error(
              `The SVG dimensions are invalid. Expected positive width and height; received ${width} × ${height}.`,
            ),
          );
          return;
        }
        if (pixels > MAX_CONVERSION_PIXELS) {
          settled = true;
          URL.revokeObjectURL(imageUrl);
          reject(
            new Error(
              `The SVG is too large to process safely. Expected 40 megapixels or less; received ${(pixels / 1_000_000).toFixed(1)} megapixels (${width} × ${height}).`,
            ),
          );
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          settled = true;
          URL.revokeObjectURL(imageUrl);
          reject(
            new Error(
              "This browser could not create an image canvas. Expected a 2D canvas context; received null.",
            ),
          );
          return;
        }

        if (outputMimeType === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);

        void encodeHtmlCanvas(canvas, outputMimeType).then(
          (blob) => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(imageUrl);
            resolve({ blob, width, height, sourceFormat: "SVG", outputMimeType });
          },
          (error: unknown) => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(imageUrl);
            reject(error instanceof Error ? error : new Error("SVG encoding failed."));
          },
        );
      };
      image.onerror = () => {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(imageUrl);
        reject(
          new Error(
            "The SVG image could not be decoded. Expected valid static vector markup; received an unreadable image.",
          ),
        );
      };
      image.src = imageUrl;
    }, (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error("SVG validation failed."));
    });
  });

  return {
    promise,
    cancel() {
      if (settled) return;
      settled = true;
      if (image) image.src = "";
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      rejectJob(new DOMException("Conversion was cancelled.", "AbortError"));
    },
  };
}

function encodeHtmlCanvas(canvas: HTMLCanvasElement, outputMimeType: OutputMimeType) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              `The browser encoder returned no image. Expected ${outputMimeType}; received null.`,
            ),
          );
          return;
        }
        if (blob.type !== outputMimeType || blob.size <= 0) {
          reject(
            new Error(
              `Output verification failed. Expected a non-empty ${outputMimeType} image; received ${blob.type || "an unknown type"} with ${blob.size} bytes.`,
            ),
          );
          return;
        }
        resolve(blob);
      },
      outputMimeType,
      outputMimeType === "image/png" ? undefined : LOSSY_QUALITY,
    );
  });
}
