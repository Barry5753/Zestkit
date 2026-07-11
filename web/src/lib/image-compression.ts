export const MAX_FILE_BYTES = 50_000_000;
export const MAX_TARGET_KB = 50_000;

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export type CompressionSuccess = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: SupportedImageType;
  quality: number | null;
};

type CompressionWorkerSuccess = CompressionSuccess & {
  type: "success";
};

type CompressionWorkerFailure = {
  type: "error";
  code: string;
  message: string;
  smallestBytes?: number;
  width?: number;
  height?: number;
};

type CompressionWorkerMessage =
  | CompressionWorkerSuccess
  | CompressionWorkerFailure;

export class CompressionError extends Error {
  code: string;
  smallestBytes?: number;
  width?: number;
  height?: number;

  constructor(failure: Omit<CompressionWorkerFailure, "type">) {
    super(failure.message);
    this.name = "CompressionError";
    this.code = failure.code;
    this.smallestBytes = failure.smallestBytes;
    this.width = failure.width;
    this.height = failure.height;
  }
}

export function validateImageFile(file: File) {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as SupportedImageType)) {
    throw new Error(
      `Unsupported image type. Expected JPG, PNG, or WebP; received ${file.type || "an unknown type"}.`,
    );
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty. Choose a file larger than 0 bytes.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `The selected image is too large. Expected 50MB or less; received ${formatBytes(file.size)}.`,
    );
  }
}

export async function readImageDimensions(file: File) {
  const image = await createImageBitmap(file, { imageOrientation: "from-image" });
  const dimensions = { width: image.width, height: image.height };
  image.close();
  return dimensions;
}

export function formatBytes(bytes: number) {
  if (bytes < 1_000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function getFileExtension(mimeType: SupportedImageType) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  return "webp";
}

export function buildDownloadName(
  sourceName: string,
  targetLabel: string,
  mimeType: SupportedImageType,
) {
  const baseName = sourceName.replace(/\.[^.]+$/, "") || "compressed-image";
  const safeTarget = targetLabel.toLowerCase().replaceAll(" ", "");
  return `${baseName}-${safeTarget}.${getFileExtension(mimeType)}`;
}

export function startCompression(file: File, targetBytes: number) {
  if (!Number.isInteger(targetBytes) || targetBytes <= 0) {
    throw new Error(
      `Invalid output limit. Expected a positive whole number of bytes; received ${targetBytes}.`,
    );
  }

  const worker = new Worker(
    new URL("../workers/compress-image.worker.ts", import.meta.url),
    { type: "module" },
  );

  let settled = false;
  let rejectJob: (error: Error) => void = () => undefined;

  const promise = new Promise<CompressionSuccess>((resolve, reject) => {
    rejectJob = reject;

    worker.onmessage = (event: MessageEvent<CompressionWorkerMessage>) => {
      settled = true;
      worker.terminate();

      if (event.data.type === "success") {
        resolve(event.data);
        return;
      }

      reject(new CompressionError(event.data));
    };

    worker.onerror = (event) => {
      settled = true;
      worker.terminate();
      reject(
        new CompressionError({
          code: "WORKER_ERROR",
          message: `The browser compression worker stopped unexpectedly. Expected a completed image; received ${event.message || "an unknown worker error"}.`,
        }),
      );
    };

    worker.postMessage({ file, targetBytes });
  });

  return {
    promise,
    cancel() {
      if (settled) return;
      settled = true;
      worker.terminate();
      rejectJob(new DOMException("Compression was cancelled.", "AbortError"));
    },
  };
}
