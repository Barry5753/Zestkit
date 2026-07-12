export const MAX_CONVERSION_FILE_BYTES = 50_000_000;

export const OUTPUT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type OutputMimeType = (typeof OUTPUT_MIME_TYPES)[number];
export type SourceImageFormat = "JPG" | "PNG" | "WebP" | "SVG" | "HEIC" | "HEIF";

const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
]);
const HEIF_BRANDS = new Set(["mif1", "msf1"]);

export async function detectImageFormat(file: File): Promise<SourceImageFormat> {
  if (file.size <= 0) {
    throw new Error("The selected image is empty. Expected more than 0 bytes; received 0 bytes.");
  }
  if (file.size > MAX_CONVERSION_FILE_BYTES) {
    throw new Error(
      `The selected image is too large. Expected 50MB or less; received ${file.size} bytes.`,
    );
  }

  const bytes = new Uint8Array(
    await file.slice(0, Math.min(file.size, 65_536)).arrayBuffer(),
  );
  const format = detectImageFormatFromBytes(bytes);
  if (!format) {
    throw new Error(
      `Unsupported image format. Expected JPG, PNG, WebP, SVG, HEIC, or HEIF; received ${file.type || "an unknown format"}.`,
    );
  }

  if (format === "SVG") validateSvgText(await file.text());
  return format;
}

export function detectImageFormatFromBytes(
  bytes: Uint8Array,
): SourceImageFormat | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "JPG";

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "PNG";
  }

  if (readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP") {
    return "WebP";
  }

  if (readAscii(bytes, 4, 4) === "ftyp") {
    const brands = getIsoBaseMediaBrands(bytes);
    if (brands.includes("avif") || brands.includes("avis")) return null;
    if (brands.some((brand) => HEIC_BRANDS.has(brand))) return "HEIC";
    if (brands.some((brand) => HEIF_BRANDS.has(brand))) return "HEIF";
  }

  const prefix = new TextDecoder().decode(bytes).replace(/^\uFEFF/, "");
  if (/<svg(?:\s|>)/i.test(prefix.slice(0, 4096))) return "SVG";
  return null;
}

export function validateSvgText(svgText: string) {
  if (!/<svg(?:\s|>)/i.test(svgText.slice(0, 4096))) {
    throw new Error("Invalid SVG. Expected an SVG root element; received unreadable XML.");
  }

  const forbiddenElement = svgText.match(
    /<(?:script|foreignObject|iframe|object|embed)(?:\s|>)/i,
  );
  if (forbiddenElement) {
    throw new Error(
      `Unsafe SVG content. Expected static vector markup; received ${forbiddenElement[0].trim()}.`,
    );
  }

  if (/\son[a-z]+\s*=/i.test(svgText)) {
    throw new Error(
      "Unsafe SVG content. Expected no event handlers; received an on-event attribute.",
    );
  }

  if (/@import/i.test(svgText) || /url\(\s*["']?(?!#)/i.test(svgText)) {
    throw new Error(
      "External SVG resources are not supported. Expected embedded shapes and fragment references only; received an external stylesheet or URL.",
    );
  }

  const hrefPattern = /(?:href|xlink:href)\s*=\s*["']([^"']+)["']/gi;
  for (const match of svgText.matchAll(hrefPattern)) {
    const href = match[1].trim();
    if (!href.startsWith("#") && !href.startsWith("data:image/")) {
      throw new Error(
        `External SVG resources are not supported. Expected a fragment or embedded image; received ${href}.`,
      );
    }
  }
}

export async function prepareSvgBlob(file: File) {
  const svgText = await file.text();
  validateSvgText(svgText);

  const svgTag = svgText.match(/<svg\b[^>]*>/i)?.[0];
  if (!svgTag) {
    throw new Error("Invalid SVG. Expected an SVG root element; received unreadable XML.");
  }

  const hasWidth = /\swidth\s*=\s*["'][^"']+["']/i.test(svgTag);
  const hasHeight = /\sheight\s*=\s*["'][^"']+["']/i.test(svgTag);
  if (hasWidth && hasHeight) return new Blob([svgText], { type: "image/svg+xml" });

  const viewBox = svgTag.match(
    /\sviewBox\s*=\s*["']\s*[-+]?\d*\.?\d+(?:e[-+]?\d+)?[\s,]+[-+]?\d*\.?\d+(?:e[-+]?\d+)?[\s,]+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)[\s,]+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*["']/i,
  );
  const width = viewBox ? Number(viewBox[1]) : Number.NaN;
  const height = viewBox ? Number(viewBox[2]) : Number.NaN;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(
      "The SVG has no usable dimensions. Expected width and height or a positive viewBox; received neither.",
    );
  }

  const dimensions = `${hasWidth ? "" : ` width="${width}"`}${hasHeight ? "" : ` height="${height}"`}`;
  return new Blob([svgText.replace(svgTag, svgTag.replace(/>$/, `${dimensions}>`))], {
    type: "image/svg+xml",
  });
}

export function validateStaticImage(bytes: Uint8Array, format: SourceImageFormat) {
  if (format === "PNG" && hasPngAnimationChunk(bytes)) {
    throw new Error(
      "Animated PNG files are not supported. Expected a static PNG; received an APNG file.",
    );
  }

  if (
    format === "WebP" &&
    readAscii(bytes, 12, 4) === "VP8X" &&
    (bytes[20] & 0x02) === 0x02
  ) {
    throw new Error(
      "Animated WebP files are not supported. Expected a static WebP; received an animated WebP file.",
    );
  }
}

export function getOutputFormatLabel(mimeType: OutputMimeType) {
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";
  return "WebP";
}

export function getOutputMimeType(format: "JPG" | "PNG" | "WebP"): OutputMimeType {
  if (format === "JPG") return "image/jpeg";
  if (format === "PNG") return "image/png";
  return "image/webp";
}

export function getOutputExtension(mimeType: OutputMimeType) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  return "webp";
}

function getIsoBaseMediaBrands(bytes: Uint8Array) {
  const brands = [readAscii(bytes, 8, 4)];
  for (let offset = 16; offset + 4 <= Math.min(bytes.length, 80); offset += 4) {
    brands.push(readAscii(bytes, offset, 4));
  }
  return brands;
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

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}
