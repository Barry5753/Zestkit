"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CircleCheck,
  Download,
  ImageIcon,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  buildDownloadName,
  CompressionError,
  type CompressionSuccess,
  formatBytes,
  MAX_TARGET_KB,
  readImageDimensions,
  startCompression,
  validateImageFile,
} from "@/lib/image-compression";
import { cn } from "@/lib/utils";

type ToolStatus = "idle" | "ready" | "compressing" | "success" | "error";

type SelectedImage = {
  file: File;
  width: number;
  height: number;
  previewUrl: string;
};

type DisplayError = {
  title: string;
  message: string;
  suggestion: string;
};

type CompressionJob = ReturnType<typeof startCompression>;
type MobilePreview = "original" | "compressed";

function getFormatLabel(mimeType: string) {
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";
  if (mimeType === "image/webp") return "WebP";
  return "Image";
}

function getDisplayError(error: unknown, targetLabel: string): DisplayError {
  if (error instanceof CompressionError && error.code === "TARGET_NOT_REACHED") {
    const smallest = error.smallestBytes
      ? formatBytes(error.smallestBytes)
      : "an unknown size";
    const dimensions =
      error.width && error.height ? ` at ${error.width} × ${error.height}` : "";

    return {
      title: `${targetLabel} is below this encoder's minimum`,
      message: `The smallest valid result was ${smallest}${dimensions}.`,
      suggestion:
        "Enter a larger target and try again. This only occurs when the image format cannot encode a valid file under the requested byte limit.",
    };
  }

  return {
    title: "This image could not be compressed",
    message:
      error instanceof Error
        ? error.message
        : "Expected a readable JPG, PNG, or WebP image; received an unknown compression error.",
    suggestion:
      "Choose another static image and try again. Your file was not uploaded or stored.",
  };
}

export function CompressorTool({
  initialTargetKilobytes,
  initialTargetLabel,
}: {
  initialTargetKilobytes: number;
  initialTargetLabel: string;
}) {
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [targetInput, setTargetInput] = useState(String(initialTargetKilobytes));
  const [result, setResult] = useState<CompressionSuccess | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [displayError, setDisplayError] = useState<DisplayError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mobilePreview, setMobilePreview] =
    useState<MobilePreview>("original");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const previewRegionRef = useRef<HTMLElement>(null);
  const activeJobRef = useRef<CompressionJob | null>(null);
  const sourceUrlRef = useRef("");
  const downloadUrlRef = useRef("");
  const selectionRequestRef = useRef(0);

  const targetKilobytes = Number(targetInput);
  const targetIsValid =
    Number.isInteger(targetKilobytes) &&
    targetKilobytes > 0 &&
    targetKilobytes <= MAX_TARGET_KB;
  const targetLabel =
    targetIsValid && targetKilobytes !== initialTargetKilobytes
      ? `${targetKilobytes}KB`
      : initialTargetLabel;
  const targetBytes = targetIsValid ? targetKilobytes * 1_000 : 0;

  const file = selectedImage?.file;
  const outputName =
    file && result
      ? buildDownloadName(file.name, targetLabel, result.mimeType)
      : "compressed-image";
  const resultNeedsReview =
    selectedImage && result
      ? Math.max(result.width, result.height) < 200 ||
        (result.quality !== null && result.quality < 0.15)
      : false;

  useEffect(() => {
    return () => {
      activeJobRef.current?.cancel();
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, []);

  function clearResult() {
    setResult(null);
    setDownloadUrl("");
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = "";
    }
  }

  function clearSelectedImage() {
    setSelectedImage(null);
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = "";
    }
  }

  async function selectImage(fileToSelect: File) {
    const selectionRequest = selectionRequestRef.current + 1;
    selectionRequestRef.current = selectionRequest;
    activeJobRef.current?.cancel();
    activeJobRef.current = null;
    clearResult();
    clearSelectedImage();
    setDisplayError(null);
    setMobilePreview("original");

    try {
      validateImageFile(fileToSelect);
      const dimensions = await readImageDimensions(fileToSelect);
      if (selectionRequestRef.current !== selectionRequest) return;

      const previewUrl = URL.createObjectURL(fileToSelect);
      sourceUrlRef.current = previewUrl;
      setSelectedImage({ file: fileToSelect, ...dimensions, previewUrl });
      setStatus("ready");
    } catch (error) {
      if (selectionRequestRef.current !== selectionRequest) return;
      setDisplayError(getDisplayError(error, targetLabel));
      setStatus("error");
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (selectedFile) void selectImage(selectedFile);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) void selectImage(droppedFile);
  }

  function handleTargetChange(event: ChangeEvent<HTMLInputElement>) {
    setTargetInput(event.currentTarget.value);
    clearResult();
    setDisplayError(null);
    setMobilePreview("original");
    setStatus(selectedImage ? "ready" : "idle");
  }

  async function handleCompress() {
    if (!selectedImage || !targetIsValid) return;

    clearResult();
    setDisplayError(null);
    setStatus("compressing");

    let job: CompressionJob | null = null;

    try {
      job = startCompression(selectedImage.file, targetBytes);
      activeJobRef.current = job;
      const compressedImage = await job.promise;
      if (activeJobRef.current !== job) return;
      if (compressedImage.blob.size > targetBytes) {
        throw new Error(
          `Final byte verification failed. Expected ${targetBytes} bytes or less; received ${compressedImage.blob.size} bytes.`,
        );
      }
      if (compressedImage.mimeType !== selectedImage.file.type) {
        throw new Error(
          `Output format verification failed. Expected ${selectedImage.file.type}; received ${compressedImage.mimeType}.`,
        );
      }

      const nextDownloadUrl = URL.createObjectURL(compressedImage.blob);
      downloadUrlRef.current = nextDownloadUrl;
      setDownloadUrl(nextDownloadUrl);
      setResult(compressedImage);
      setStatus("success");
      setMobilePreview("compressed");
      activeJobRef.current = null;

      requestAnimationFrame(() => {
        const isNarrowViewport = window.innerWidth < 1024;
        resultHeadingRef.current?.focus({ preventScroll: !isNarrowViewport });
        if (isNarrowViewport) {
          const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          previewRegionRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (job && activeJobRef.current !== job) return;
      activeJobRef.current = null;
      setDisplayError(getDisplayError(error, targetLabel));
      setStatus("error");
    }
  }

  function resetTool() {
    selectionRequestRef.current += 1;
    activeJobRef.current?.cancel();
    activeJobRef.current = null;
    clearSelectedImage();
    clearResult();
    setDisplayError(null);
    setMobilePreview("original");
    setStatus("idle");
  }

  return (
    <section
      aria-label={`Compress an image to ${initialTargetLabel}`}
      className="border-b border-border bg-background"
    >
      <input
        ref={fileInputRef}
        id="image-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileInput}
      />

      <div className="grid lg:grid-cols-[minmax(420px,30.4vw)_minmax(0,1fr)]">
        <section className="px-5 py-10 sm:px-8 lg:min-h-[calc(100svh-92px)] lg:border-r lg:border-border lg:px-10 lg:py-[88px] xl:px-[42px]">
          <h1 className="relative max-w-[360px] text-[42px] leading-[1.08] font-bold tracking-[-0.055em] text-foreground sm:text-[48px] lg:text-[46px] min-[1400px]:text-[52px]">
            <span className="block">Compress</span>
            <span className="block">Image to {initialTargetLabel}</span>
            <span className="absolute top-1.5 right-0 rounded-full border border-[#bde7d7] bg-[#eaf8f2] px-3 py-1 text-[13px] leading-5 font-semibold tracking-[-0.01em] text-[#087f5b]">
              for Free
            </span>
          </h1>
          <div className="mt-7 text-[17px] leading-8 text-muted-foreground">
            <p>Same format. Verified size.</p>
            <p>Processed on your device.</p>
          </div>

          <div className="mt-12">
            <Label htmlFor="target-size" className="text-[15px] font-medium">
              Maximum output size
            </Label>
            <div className="relative mt-4 max-w-[256px]">
              <Input
                id="target-size"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_TARGET_KB}
                step={1}
                value={targetInput}
                disabled={status === "compressing"}
                aria-invalid={!targetIsValid}
                aria-describedby="target-size-help"
                className="h-[54px] rounded-[10px] bg-card px-4 pr-16 text-base shadow-none"
                onChange={handleTargetChange}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-center border-l border-input text-sm font-semibold text-muted-foreground">
                KB
              </span>
            </div>
            <p
              id="target-size-help"
              className={cn(
                targetIsValid
                  ? "sr-only"
                  : "mt-2 text-xs leading-5 font-medium text-destructive",
              )}
            >
              {targetIsValid
                ? `The result will be ${targetLabel} or less.`
                : `Enter a whole number from 1 to ${MAX_TARGET_KB.toLocaleString()}KB.`}
            </p>
          </div>

          {selectedImage && status !== "success" && (
            <div className="mt-8 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedImage.file.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {formatBytes(selectedImage.file.size)} · {selectedImage.width} ×{" "}
                {selectedImage.height} · {getFormatLabel(selectedImage.file.type)}
              </p>
            </div>
          )}

          {status === "success" && selectedImage && result && (
            <div className="mt-10" aria-live="polite">
              <div className="flex items-start gap-4">
                <CircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-6 shrink-0 fill-[#19b774] text-white"
                  strokeWidth={3}
                />
                <div>
                  <h2
                    ref={resultHeadingRef}
                    tabIndex={-1}
                    className="text-base font-bold outline-none"
                  >
                    Target reached
                  </h2>
                  <div className="mt-4 space-y-3 text-[15px] leading-6 text-muted-foreground tabular-nums">
                    <p>
                      {formatBytes(selectedImage.file.size)} →{" "}
                      {formatBytes(result.blob.size)}
                    </p>
                    <p>
                      {selectedImage.width} × {selectedImage.height} → {result.width} ×{" "}
                      {result.height}
                    </p>
                    <p>{getFormatLabel(result.mimeType)} preserved</p>
                  </div>
                </div>
              </div>

              {resultNeedsReview && (
                <Alert className="mt-6 border-[#ead8a5] bg-[#fff8e7] px-3 py-3">
                  <TriangleAlert aria-hidden="true" className="text-[#9a6700]" />
                  <AlertTitle className="text-[#6f4c00]">Review the preview</AlertTitle>
                  <AlertDescription className="text-[#735c27]">
                    This target required a strong reduction. The download is ready,
                    but compare both images first.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {displayError && (
            <Alert className="mt-8 border-[#f2c8c4] bg-[#fff4f2] px-3 py-3">
              <TriangleAlert aria-hidden="true" className="text-destructive" />
              <AlertTitle className="text-destructive">{displayError.title}</AlertTitle>
              <AlertDescription>
                <p>{displayError.message}</p>
                <p>{displayError.suggestion}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-9 space-y-4">
            {(status === "idle" || (status === "error" && !selectedImage)) && (
              <Button
                type="button"
                size="lg"
                className="h-[60px] w-full max-w-[344px] rounded-[10px] text-base"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload aria-hidden="true" className="size-5" />
                Choose image
              </Button>
            )}

            {(status === "ready" || status === "error") && selectedImage && (
              <Button
                type="button"
                size="lg"
                className="h-[60px] w-full max-w-[344px] rounded-[10px] text-base"
                disabled={!targetIsValid}
                onClick={handleCompress}
              >
                Compress to {targetLabel}
              </Button>
            )}

            {status === "compressing" && (
              <Button
                type="button"
                size="lg"
                className="h-[60px] w-full max-w-[344px] rounded-[10px] text-base"
                disabled
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-5 animate-spin motion-reduce:animate-none"
                />
                Compressing…
              </Button>
            )}

            {status === "success" && result && (
              <Button
                asChild
                size="lg"
                className="h-[68px] w-full max-w-[344px] rounded-[10px] text-base"
              >
                <a href={downloadUrl} download={outputName}>
                  <Download aria-hidden="true" className="size-5" />
                  Download {getFormatLabel(result.mimeType)} ·{" "}
                  {formatBytes(result.blob.size)}
                </a>
              </Button>
            )}

            {selectedImage && status !== "compressing" && (
              <Button
                type="button"
                variant="ghost"
                className="h-11 justify-start px-2 text-base text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <RotateCcw aria-hidden="true" className="size-5" />
                Change image
              </Button>
            )}

            {status === "success" && (
              <Button
                type="button"
                variant="ghost"
                className="h-10 justify-start px-2 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={resetTool}
              >
                Start over
              </Button>
            )}
          </div>

          {status === "idle" && (
            <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="size-4 text-[#138a5b]" />
              No upload, account, or payment required
            </p>
          )}
        </section>

        <section
          ref={previewRegionRef}
          className="scroll-mt-4 px-5 py-10 sm:px-8 lg:min-h-[calc(100svh-92px)] lg:px-12 lg:py-[88px] xl:px-[50px]"
        >
          {!selectedImage ? (
            <UploadStage
              isDragging={isDragging}
              onChooseImage={() => fileInputRef.current?.click()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            />
          ) : (
            <>
              <div className="hidden grid-cols-2 gap-12 lg:grid xl:gap-14">
                <PreviewPanel
                  title="Original"
                  fileSize={selectedImage.file.size}
                  width={selectedImage.width}
                  height={selectedImage.height}
                  mimeType={selectedImage.file.type}
                  imageUrl={selectedImage.previewUrl}
                  alt={`Original preview of ${selectedImage.file.name}`}
                />
                <PreviewPanel
                  title="Compressed"
                  fileSize={result?.blob.size}
                  width={result?.width}
                  height={result?.height}
                  mimeType={result?.mimeType ?? selectedImage.file.type}
                  imageUrl={downloadUrl}
                  alt={`Compressed preview of ${selectedImage.file.name}`}
                  isLoading={status === "compressing"}
                  emptyMessage={
                    displayError
                      ? "Adjust the target and try again."
                      : "Your compressed preview will appear here."
                  }
                />
              </div>

              <Tabs
                value={mobilePreview}
                className="lg:hidden"
                onValueChange={(value) =>
                  setMobilePreview(value === "compressed" ? "compressed" : "original")
                }
              >
                <TabsList className="mb-5 grid h-11 w-full grid-cols-2 rounded-[10px] p-1">
                  <TabsTrigger value="original" className="h-full rounded-md">
                    Original
                  </TabsTrigger>
                  <TabsTrigger value="compressed" className="h-full rounded-md">
                    Compressed
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original">
                  <PreviewPanel
                    title="Original"
                    fileSize={selectedImage.file.size}
                    width={selectedImage.width}
                    height={selectedImage.height}
                    mimeType={selectedImage.file.type}
                    imageUrl={selectedImage.previewUrl}
                    alt={`Original preview of ${selectedImage.file.name}`}
                  />
                </TabsContent>
                <TabsContent value="compressed">
                  <PreviewPanel
                    title="Compressed"
                    fileSize={result?.blob.size}
                    width={result?.width}
                    height={result?.height}
                    mimeType={result?.mimeType ?? selectedImage.file.type}
                    imageUrl={downloadUrl}
                    alt={`Compressed preview of ${selectedImage.file.name}`}
                    isLoading={status === "compressing"}
                    emptyMessage={
                      displayError
                        ? "Adjust the target and try again."
                        : "Your compressed preview will appear here."
                    }
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

function UploadStage({
  isDragging,
  onChooseImage,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  isDragging: boolean;
  onChooseImage: () => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] flex-col items-center justify-center rounded-[12px] border border-dashed border-input bg-card px-6 text-center transition-colors lg:min-h-[620px]",
        isDragging && "border-primary bg-secondary",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter();
      }}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <ImageIcon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-6 text-xl font-bold tracking-[-0.02em]">
        Drop one image here
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        JPG, PNG, or WebP · Up to 50MB
      </p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-6 h-11 rounded-[10px] bg-background px-5"
        onClick={onChooseImage}
      >
        Choose image
      </Button>
      <p className="mt-6 text-xs text-muted-foreground">
        Your image stays in this browser tab.
      </p>
    </div>
  );
}

function PreviewPanel({
  title,
  fileSize,
  width,
  height,
  mimeType,
  imageUrl,
  alt,
  isLoading = false,
  emptyMessage = "Waiting for compression.",
}: {
  title: string;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType: string;
  imageUrl: string;
  alt: string;
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  return (
    <figure className="min-w-0">
      <figcaption className="min-h-[92px]">
        <h2 className="text-[17px] font-bold tracking-[-0.01em]">{title}</h2>
        {fileSize && width && height ? (
          <div className="mt-3 space-y-1 text-[15px] leading-6 text-muted-foreground tabular-nums">
            <p>{formatBytes(fileSize)}</p>
            <p>
              {width} × {height} · {getFormatLabel(mimeType)}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {isLoading ? "Finding the best result under your limit…" : "Not compressed yet"}
          </p>
        )}
      </figcaption>

      <div className="relative mt-7 aspect-[4/5] overflow-hidden rounded-[10px] bg-[#efeee9] ring-1 ring-black/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            unoptimized
            sizes="(min-width: 1024px) 32vw, 92vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            {isLoading ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="size-6 animate-spin text-primary motion-reduce:animate-none"
                />
                <Progress
                  aria-label="Compression in progress"
                  className="indeterminate-progress mt-6 w-full max-w-[220px]"
                />
              </>
            ) : (
              <ImageIcon aria-hidden="true" className="size-6 text-muted-foreground" />
            )}
            <p className="mt-5 max-w-[220px] text-sm leading-6 text-muted-foreground">
              {isLoading ? "Compressing and verifying the final byte size." : emptyMessage}
            </p>
          </div>
        )}
      </div>
    </figure>
  );
}
