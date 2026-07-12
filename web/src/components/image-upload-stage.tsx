import { type DragEvent } from "react";
import { ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ImageUploadStage({
  isDragging,
  supportedFormats,
  onChooseImage,
  onDragEnter,
  onDragLeave,
  onDrop,
}: {
  isDragging: boolean;
  supportedFormats: string;
  onChooseImage: () => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] flex-col items-center justify-center rounded-[12px] border border-dashed border-input bg-card px-6 text-center transition-colors lg:min-h-[520px]",
        isDragging && "border-primary bg-secondary",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter();
      }}
      onDragLeave={onDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <ImageIcon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-6 text-xl font-bold tracking-[-0.02em]">
        Drop one image here
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {supportedFormats} · Up to 50MB
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
