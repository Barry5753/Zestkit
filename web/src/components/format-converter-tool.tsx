"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  CircleCheck,
  Download,
  FileImage,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ImageUploadStage } from "@/components/image-upload-stage";
import {
  buildConvertedName,
  type ConversionSuccess,
  startConversion,
  validateConversionFile,
} from "@/lib/image-conversion";
import {
  getOutputFormatLabel,
  getOutputMimeType,
  type SourceImageFormat,
} from "@/lib/image-format";
import { formatBytes } from "@/lib/image-compression";
import { cn } from "@/lib/utils";

const outputFormats = ["JPG", "PNG", "WebP"] as const;
type OutputFormat = (typeof outputFormats)[number];
type ToolStatus = "idle" | "selecting" | "ready" | "converting" | "success" | "error";
type ConversionJob = ReturnType<typeof startConversion>;

type SelectedFile = {
  file: File;
  sourceFormat: SourceImageFormat;
  previewUrl: string;
  canPreview: boolean;
};

type DisplayError = {
  title: string;
  message: string;
};

function getDisplayError(error: unknown): DisplayError {
  return {
    title: "This image could not be converted",
    message:
      error instanceof Error
        ? error.message
        : "Expected a readable JPG, PNG, WebP, SVG, HEIC, or HEIF image; received an unknown conversion error.",
  };
}

export function FormatConverterTool() {
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("JPG");
  const [result, setResult] = useState<ConversionSuccess | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [displayError, setDisplayError] = useState<DisplayError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const previewRegionRef = useRef<HTMLElement>(null);
  const sourceUrlRef = useRef("");
  const downloadUrlRef = useRef("");
  const activeJobRef = useRef<ConversionJob | null>(null);
  const selectionRequestRef = useRef(0);

  const outputMimeType = getOutputMimeType(outputFormat);
  const outputName = selectedFile
    ? buildConvertedName(selectedFile.file.name, outputMimeType)
    : `converted-image.${outputFormat.toLowerCase()}`;

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

  function clearSelectedFile() {
    setSelectedFile(null);
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = "";
    }
  }

  async function selectFile(file: File) {
    const selectionRequest = selectionRequestRef.current + 1;
    selectionRequestRef.current = selectionRequest;
    activeJobRef.current?.cancel();
    activeJobRef.current = null;
    clearResult();
    clearSelectedFile();
    setDisplayError(null);
    setStatus("selecting");

    try {
      const sourceFormat = await validateConversionFile(file);
      if (selectionRequestRef.current !== selectionRequest) return;

      const previewUrl = URL.createObjectURL(file);
      sourceUrlRef.current = previewUrl;
      const canPreview = sourceFormat !== "HEIC" && sourceFormat !== "HEIF";
      setSelectedFile({ file, sourceFormat, previewUrl, canPreview });
      setOutputFormat((currentFormat) =>
        currentFormat === sourceFormat
          ? sourceFormat === "JPG"
            ? "PNG"
            : "JPG"
          : currentFormat,
      );
      setStatus("ready");
    } catch (error) {
      if (selectionRequestRef.current !== selectionRequest) return;
      setDisplayError(getDisplayError(error));
      setStatus("error");
    }
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) void selectFile(file);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void selectFile(file);
  }

  function changeOutputFormat(format: OutputFormat) {
    if (format === selectedFile?.sourceFormat) return;
    activeJobRef.current?.cancel();
    activeJobRef.current = null;
    clearResult();
    setDisplayError(null);
    setOutputFormat(format);
    setStatus(selectedFile ? "ready" : "idle");
  }

  async function handleConvert() {
    if (!selectedFile) return;

    clearResult();
    setDisplayError(null);
    setStatus("converting");

    const job = startConversion(
      selectedFile.file,
      outputMimeType,
      selectedFile.sourceFormat,
    );
    activeJobRef.current = job;

    try {
      const convertedImage = await job.promise;
      if (activeJobRef.current !== job) return;

      const nextDownloadUrl = URL.createObjectURL(convertedImage.blob);
      downloadUrlRef.current = nextDownloadUrl;
      setDownloadUrl(nextDownloadUrl);
      setResult(convertedImage);
      setStatus("success");
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
      if (activeJobRef.current !== job) return;
      activeJobRef.current = null;
      setDisplayError(getDisplayError(error));
      setStatus("error");
    }
  }

  function resetTool() {
    selectionRequestRef.current += 1;
    activeJobRef.current?.cancel();
    activeJobRef.current = null;
    clearSelectedFile();
    clearResult();
    setDisplayError(null);
    setStatus("idle");
  }

  const sourcePreviewUrl = selectedFile?.canPreview ? selectedFile.previewUrl : downloadUrl;

  return (
    <section className="border-b border-border bg-background">
      <input
        ref={inputRef}
        id="format-converter-file"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg,.heic,.heif,image/jpeg,image/png,image/webp,image/svg+xml,image/heic,image/heif"
        className="sr-only"
        onChange={handleInput}
      />

      <div className="site-container grid lg:grid-cols-[minmax(420px,30.4%)_minmax(0,1fr)]">
        <section className="px-5 py-10 sm:px-8 lg:border-r lg:border-border lg:px-10 lg:py-16 xl:px-[42px]">
          <h1 className="relative max-w-[370px] text-[42px] leading-[1.04] font-bold tracking-[-0.057em] text-foreground sm:text-[48px] lg:text-[46px] min-[1400px]:text-[52px]">
            <span className="block">Convert</span>
            <span className="block">Image Format</span>
            <span className="absolute top-1.5 right-0 rounded-full border border-[#bde7d7] bg-[#eaf8f2] px-3 py-1 text-[13px] leading-5 font-semibold tracking-[-0.01em] text-[#087f5b]">
              for Free
            </span>
          </h1>

          <div className="mt-7 text-[17px] leading-8 text-muted-foreground">
            <p>Automatic format detection.</p>
            <p>Processed on your device.</p>
          </div>

          <div className="mt-12">
            <p className="text-[15px] font-medium text-foreground">Output format</p>
            <div
              className="mt-4 grid max-w-[344px] grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="Output format"
            >
              {outputFormats.map((format) => {
                const matchesSource = format === selectedFile?.sourceFormat;
                return (
                  <button
                    key={format}
                    type="button"
                    role="radio"
                    aria-checked={outputFormat === format}
                    disabled={matchesSource || status === "converting"}
                    className={cn(
                      "h-[52px] rounded-[10px] border bg-card text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
                      outputFormat === format
                        ? "border-primary bg-secondary text-primary shadow-[inset_0_0_0_1px_var(--color-primary)]"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                    onClick={() => changeOutputFormat(format)}
                  >
                    {format}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedFile && status !== "success" && (
            <div className="mt-8 min-w-0 max-w-[344px]">
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedFile.file.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {formatBytes(selectedFile.file.size)} · Detected {selectedFile.sourceFormat}
              </p>
            </div>
          )}

          {status === "success" && selectedFile && result && (
            <div className="mt-9" aria-live="polite">
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
                    Conversion complete
                  </h2>
                  <div className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground tabular-nums">
                    <p>
                      {selectedFile.sourceFormat} → {getOutputFormatLabel(result.outputMimeType)}
                    </p>
                    <p>
                      {formatBytes(selectedFile.file.size)} → {formatBytes(result.blob.size)}
                    </p>
                    <p>
                      {result.width} × {result.height}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {displayError && (
            <Alert className="mt-8 border-[#f2c8c4] bg-[#fff4f2] px-3 py-3">
              <TriangleAlert aria-hidden="true" className="text-destructive" />
              <AlertTitle className="text-destructive">{displayError.title}</AlertTitle>
              <AlertDescription>{displayError.message}</AlertDescription>
            </Alert>
          )}

          <div className="mt-9 space-y-3">
            {(status === "idle" || status === "selecting" ||
              (status === "error" && !selectedFile)) && (
              <Button
                type="button"
                size="lg"
                className="h-[60px] w-full max-w-[344px] rounded-[10px] text-base"
                disabled={status === "selecting"}
                onClick={() => inputRef.current?.click()}
              >
                {status === "selecting" ? (
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                ) : (
                  <Upload aria-hidden="true" className="size-5" />
                )}
                {status === "selecting" ? "Reading image…" : "Choose image"}
              </Button>
            )}

            {(status === "ready" || (status === "error" && selectedFile)) && (
              <Button
                type="button"
                size="lg"
                className="h-[60px] w-full max-w-[344px] rounded-[10px] text-base"
                onClick={handleConvert}
              >
                Convert to {outputFormat}
                <ArrowRight aria-hidden="true" className="size-5" />
              </Button>
            )}

            {status === "converting" && (
              <Button
                type="button"
                size="lg"
                className="h-[60px] w-full max-w-[344px] rounded-[10px] text-base"
                disabled
              >
                <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                Converting…
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
                  Download {getOutputFormatLabel(result.outputMimeType)} ·{" "}
                  {formatBytes(result.blob.size)}
                </a>
              </Button>
            )}

            {selectedFile && status !== "converting" && status !== "success" && (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full max-w-[344px] rounded-[10px] bg-card text-sm hover:border-primary/40 hover:bg-secondary"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus aria-hidden="true" className="size-4" />
                Change image
              </Button>
            )}

            {status === "success" && (
              <div className="grid w-full max-w-[344px] grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-[10px] bg-card text-sm hover:border-primary/40 hover:bg-secondary"
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus aria-hidden="true" className="size-4" />
                  Change image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-[10px] bg-card text-sm text-muted-foreground hover:border-destructive/30 hover:bg-[#fff4f2] hover:text-destructive"
                  onClick={resetTool}
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear
                </Button>
              </div>
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
          className="scroll-mt-4 px-5 py-10 sm:px-8 lg:px-12 lg:py-16 xl:px-[50px]"
        >
          {!selectedFile ? (
            <ImageUploadStage
              isDragging={isDragging}
              supportedFormats="JPG, PNG, WebP, SVG, HEIC, or HEIF"
              onChooseImage={() => inputRef.current?.click()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            />
          ) : (
            <div className="grid min-h-[520px] items-center gap-6 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] lg:gap-4">
              <PreviewCard
                label="Original"
                format={selectedFile.sourceFormat}
                fileName={selectedFile.file.name}
                fileSize={selectedFile.file.size}
                previewUrl={sourcePreviewUrl}
                emptyMessage={
                  status === "converting"
                    ? `Decoding ${selectedFile.sourceFormat} locally…`
                    : `The ${selectedFile.sourceFormat} preview will appear after conversion.`
                }
              />

              <div className="flex size-12 items-center justify-center justify-self-center rounded-full border border-border bg-card text-primary">
                <ArrowDown aria-hidden="true" className="size-5 lg:hidden" />
                <ArrowRight aria-hidden="true" className="hidden size-5 lg:block" />
              </div>

              <PreviewCard
                label="Converted"
                format={outputFormat}
                fileName={outputName}
                fileSize={result?.blob.size}
                previewUrl={downloadUrl}
                isLoading={status === "converting"}
                emptyMessage={
                  displayError
                    ? "Choose another file or output format and try again."
                    : `Your ${outputFormat} preview will appear here.`
                }
              />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function PreviewCard({
  label,
  format,
  fileName,
  fileSize,
  previewUrl,
  isLoading = false,
  emptyMessage,
}: {
  label: string;
  format: string;
  fileName: string;
  fileSize?: number;
  previewUrl: string;
  isLoading?: boolean;
  emptyMessage: string;
}) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-4 flex min-h-10 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">{label}</h2>
          {fileSize && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {formatBytes(fileSize)} · {fileName}
            </p>
          )}
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
          {format}
        </span>
      </figcaption>

      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[10px] border border-border bg-[linear-gradient(45deg,#f1efe9_25%,transparent_25%,transparent_75%,#f1efe9_75%),linear-gradient(45deg,#f1efe9_25%,#fffefa_25%,#fffefa_75%,#f1efe9_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] lg:min-h-[420px]">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={`Preview of ${fileName}`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 32vw, 92vw"
            className="object-contain p-5"
          />
        ) : (
          <div className="px-7 text-center">
            {isLoading ? (
              <LoaderCircle
                aria-hidden="true"
                className="mx-auto size-6 animate-spin text-primary"
              />
            ) : (
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <FileImage aria-hidden="true" className="size-5" />
              </span>
            )}
            <p className="mt-5 max-w-[220px] text-sm leading-6 text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </figure>
  );
}
