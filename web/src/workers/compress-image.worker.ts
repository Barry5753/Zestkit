/// <reference lib="webworker" />

const MAX_FILE_BYTES = 50_000_000;
const MAX_PIXELS = 40_000_000;
const MIN_QUALITY = 0;
const MAX_QUALITY = 1;
const MAX_RESIZE_PASSES = 32;

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type SupportedImageType = (typeof SUPPORTED_TYPES)[number];

type CompressionRequest = {
  file: File;
  targetBytes: number;
};

type CompressionResult = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: SupportedImageType;
  quality: number | null;
};

class WorkerCompressionError extends Error {
  code: string;
  smallestBytes?: number;
  width?: number;
  height?: number;

  constructor(
    code: string,
    message: string,
    details: { smallestBytes?: number; width?: number; height?: number } = {},
  ) {
    super(message);
    this.code = code;
    this.smallestBytes = details.smallestBytes;
    this.width = details.width;
    this.height = details.height;
  }
}

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = async (event: MessageEvent<CompressionRequest>) => {
  try {
    const result = await compressImage(event.data.file, event.data.targetBytes);
    workerScope.postMessage({ type: "success", ...result });
  } catch (error) {
    const failure =
      error instanceof WorkerCompressionError
        ? error
        : new WorkerCompressionError(
            "ENCODING_ERROR",
            error instanceof Error
              ? error.message
              : "Image compression failed with an unknown error.",
          );

    workerScope.postMessage({
      type: "error",
      code: failure.code,
      message: failure.message,
      smallestBytes: failure.smallestBytes,
      width: failure.width,
      height: failure.height,
    });
  }
};

async function compressImage(file: File, targetBytes: number): Promise<CompressionResult> {
  validateRequest(file, targetBytes);

  const mimeType = file.type as SupportedImageType;
  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  validateSignature(sourceBytes, mimeType);
  validateAnimation(sourceBytes, mimeType);

  const sourceImage = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const sourcePixels = sourceImage.width * sourceImage.height;
  if (sourceImage.width <= 0 || sourceImage.height <= 0) {
    sourceImage.close();
    throw new WorkerCompressionError(
      "INVALID_DIMENSIONS",
      `The image dimensions are invalid. Expected positive width and height; received ${sourceImage.width} × ${sourceImage.height}.`,
    );
  }

  if (sourcePixels > MAX_PIXELS) {
    const width = sourceImage.width;
    const height = sourceImage.height;
    sourceImage.close();
    throw new WorkerCompressionError(
      "TOO_MANY_PIXELS",
      `The image is too large to process safely in this browser. Expected 40 megapixels or less; received ${(sourcePixels / 1_000_000).toFixed(1)} megapixels (${width} × ${height}).`,
    );
  }

  if (file.size <= targetBytes) {
    const result = {
      blob: file,
      width: sourceImage.width,
      height: sourceImage.height,
      mimeType,
      quality: null,
    };
    sourceImage.close();
    return result;
  }

  try {
    return await encodeUnderLimit(sourceImage, mimeType, targetBytes);
  } finally {
    sourceImage.close();
  }
}

function validateRequest(file: File, targetBytes: number) {
  if (!SUPPORTED_TYPES.includes(file.type as SupportedImageType)) {
    throw new WorkerCompressionError(
      "UNSUPPORTED_TYPE",
      `Unsupported image type. Expected JPG, PNG, or WebP; received ${file.type || "an unknown type"}.`,
    );
  }

  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    throw new WorkerCompressionError(
      "INVALID_FILE_SIZE",
      `Invalid source size. Expected more than 0 bytes and no more than 50MB; received ${file.size} bytes.`,
    );
  }

  if (!Number.isInteger(targetBytes) || targetBytes <= 0 || targetBytes > MAX_FILE_BYTES) {
    throw new WorkerCompressionError(
      "INVALID_TARGET",
      `Invalid output limit. Expected a whole number from 1 to ${MAX_FILE_BYTES} bytes; received ${targetBytes}.`,
    );
  }
}

function validateSignature(bytes: Uint8Array, mimeType: SupportedImageType) {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP";

  const signatureMatches =
    (mimeType === "image/jpeg" && isJpeg) ||
    (mimeType === "image/png" && isPng) ||
    (mimeType === "image/webp" && isWebp);

  if (!signatureMatches) {
    throw new WorkerCompressionError(
      "SIGNATURE_MISMATCH",
      `The file content does not match its declared format. Expected ${mimeType}; received a different or damaged file signature.`,
    );
  }
}

function validateAnimation(bytes: Uint8Array, mimeType: SupportedImageType) {
  if (mimeType === "image/png" && hasPngAnimationChunk(bytes)) {
    throw new WorkerCompressionError(
      "ANIMATED_IMAGE",
      "Animated PNG files are not supported yet. Expected a static PNG; received an APNG file.",
    );
  }

  if (
    mimeType === "image/webp" &&
    readAscii(bytes, 12, 4) === "VP8X" &&
    (bytes[20] & 0x02) === 0x02
  ) {
    throw new WorkerCompressionError(
      "ANIMATED_IMAGE",
      "Animated WebP files are not supported yet. Expected a static WebP; received an animated WebP file.",
    );
  }
}

function hasPngAnimationChunk(bytes: Uint8Array) {
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const chunkLength = readUint32(bytes, offset);
    const chunkType = readAscii(bytes, offset + 4, 4);
    if (chunkType === "acTL") return true;
    if (chunkType === "IDAT" || chunkType === "IEND") return false;
    offset += 12 + chunkLength;
  }
  return false;
}

async function encodeUnderLimit(
  sourceImage: ImageBitmap,
  mimeType: SupportedImageType,
  targetBytes: number,
) {
  const sourceLongEdge = Math.max(sourceImage.width, sourceImage.height);
  const minimumScale = 1 / sourceLongEdge;

  let scale = 1;
  let smallestBlob: Blob | null = null;
  let smallestWidth = sourceImage.width;
  let smallestHeight = sourceImage.height;

  for (let pass = 0; pass < MAX_RESIZE_PASSES; pass += 1) {
    const width = Math.max(1, Math.round(sourceImage.width * scale));
    const height = Math.max(1, Math.round(sourceImage.height * scale));
    const canvas = renderSource(sourceImage, width, height);

    if (mimeType === "image/png") {
      const blob = await encodeCanvas(canvas, mimeType);
      if (!smallestBlob || blob.size < smallestBlob.size) {
        smallestBlob = blob;
        smallestWidth = width;
        smallestHeight = height;
      }
      if (blob.size <= targetBytes) {
        await verifyOutput(blob, mimeType);
        return { blob, width, height, mimeType, quality: null };
      }
      const nextScale = getNextScale(scale, targetBytes, blob.size, minimumScale);
      if (nextScale === scale) break;
      scale = nextScale;
      continue;
    }

    const lossyResult = await findBestLossyBlob(canvas, mimeType, targetBytes);
    if (!smallestBlob || lossyResult.smallestBlob.size < smallestBlob.size) {
      smallestBlob = lossyResult.smallestBlob;
      smallestWidth = width;
      smallestHeight = height;
    }
    if (lossyResult.bestBlob) {
      await verifyOutput(lossyResult.bestBlob, mimeType);
      return {
        blob: lossyResult.bestBlob,
        width,
        height,
        mimeType,
        quality: lossyResult.bestQuality,
      };
    }

    const nextScale = getNextScale(
      scale,
      targetBytes,
      lossyResult.smallestBlob.size,
      minimumScale,
    );
    if (nextScale === scale) break;
    scale = nextScale;
  }

  throw new WorkerCompressionError(
    "TARGET_NOT_REACHED",
    `Could not reach ${targetBytes} bytes even at the encoder's technical minimum. Smallest valid result: ${smallestBlob?.size ?? fileSizeFallback(targetBytes)} bytes.`,
    {
      smallestBytes: smallestBlob?.size,
      width: smallestWidth,
      height: smallestHeight,
    },
  );
}

function renderSource(sourceImage: ImageBitmap, width: number, height: number) {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new WorkerCompressionError(
      "CANVAS_UNAVAILABLE",
      "This browser could not create an image canvas. Expected a 2D canvas context; received null.",
    );
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(sourceImage, 0, 0, width, height);
  return canvas;
}

async function encodeCanvas(
  canvas: OffscreenCanvas,
  mimeType: SupportedImageType,
  quality?: number,
) {
  const blob = await canvas.convertToBlob({ type: mimeType, quality });
  if (blob.type !== mimeType) {
    throw new WorkerCompressionError(
      "ENCODER_UNAVAILABLE",
      `This browser cannot encode ${mimeType} images locally. Expected ${mimeType}; received ${blob.type || "an unknown output type"}.`,
    );
  }
  return blob;
}

async function findBestLossyBlob(
  canvas: OffscreenCanvas,
  mimeType: "image/jpeg" | "image/webp",
  targetBytes: number,
) {
  const minimumBlob = await encodeCanvas(canvas, mimeType, MIN_QUALITY);
  if (minimumBlob.size > targetBytes) {
    return {
      bestBlob: null,
      bestQuality: null,
      smallestBlob: minimumBlob,
    };
  }

  const maximumBlob = await encodeCanvas(canvas, mimeType, MAX_QUALITY);
  if (maximumBlob.size <= targetBytes) {
    return {
      bestBlob: maximumBlob,
      bestQuality: MAX_QUALITY,
      smallestBlob: minimumBlob,
    };
  }

  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let bestBlob = minimumBlob;
  let bestQuality = MIN_QUALITY;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const quality = (low + high) / 2;
    const blob = await encodeCanvas(canvas, mimeType, quality);
    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQuality = quality;
      low = quality;
    } else {
      high = quality;
    }
  }

  return { bestBlob, bestQuality, smallestBlob: minimumBlob };
}

function getNextScale(
  currentScale: number,
  targetBytes: number,
  currentBytes: number,
  minimumScale: number,
) {
  if (currentScale <= minimumScale) return currentScale;
  const proportionalScale = Math.sqrt(targetBytes / currentBytes) * 0.96;
  const scaleFactor = Math.min(0.9, Math.max(0.5, proportionalScale));
  return Math.max(minimumScale, Number((currentScale * scaleFactor).toFixed(4)));
}

async function verifyOutput(blob: Blob, mimeType: SupportedImageType) {
  if (blob.size <= 0) {
    throw new WorkerCompressionError(
      "EMPTY_OUTPUT",
      "The browser encoder returned an empty image. Expected more than 0 bytes; received 0 bytes.",
    );
  }
  const bytes = new Uint8Array(await blob.slice(0, 24).arrayBuffer());
  validateSignature(bytes, mimeType);
  const decodedOutput = await createImageBitmap(blob);
  if (decodedOutput.width <= 0 || decodedOutput.height <= 0) {
    decodedOutput.close();
    throw new WorkerCompressionError(
      "INVALID_OUTPUT",
      `The compressed image could not be verified. Expected positive dimensions; received ${decodedOutput.width} × ${decodedOutput.height}.`,
    );
  }
  decodedOutput.close();
}

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

function fileSizeFallback(targetBytes: number) {
  return Math.max(targetBytes + 1, 1);
}

export {};
