import { DownloadIcon, ImageIcon } from "lucide-react";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ImageGenerationToolPart } from "@/tools";

function buildDownloadName(prompt: string): string {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join("_");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${slug || "image"}_${timestamp}.png`;
}

export function ImageGenerationPart({
  part,
}: {
  part: ImageGenerationToolPart;
}) {
  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Generating image
          {part.input?.aspectRatio ? ` (${part.input.aspectRatio})` : ""}…
        </div>
      );
    case "output-available": {
      if ("error" in part.output) {
        return (
          <div className="text-sm text-destructive">{part.output.error}</div>
        );
      }
      const aspectRatio =
        part.input?.aspectRatio?.replace(":", " / ") ?? "1 / 1";
      const downloadName = buildDownloadName(part.output.prompt);
      return (
        <div className="flex w-full max-w-md flex-col gap-2">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-border"
            style={{ aspectRatio }}
          >
            <Image
              src={part.output.image}
              alt={part.output.prompt}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-1.5 text-xs text-muted-foreground">
            <p className="flex min-w-0 items-center gap-1.5">
              <ImageIcon className="size-3 shrink-0" />
              <span className="truncate">{part.output.prompt}</span>
            </p>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={part.output.image}
                    download={downloadName}
                    aria-label="Download image"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon-xs",
                    })}
                  />
                }
              >
                <DownloadIcon />
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    }
    case "output-error":
      return (
        <div className="text-sm text-destructive">
          Image generation failed: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}
