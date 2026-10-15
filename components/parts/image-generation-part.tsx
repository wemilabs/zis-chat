import { DownloadIcon, ImageIcon } from "lucide-react";
import Image from "next/image";

import { StatusIcon } from "@/components/status-icon";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
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

function ImageGenerationError({ message }: { message: string }) {
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine status="error">
          <TraceIcon>
            <StatusIcon status="error" />
          </TraceIcon>
          <TraceTitle>Failed to generate image</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="text-destructive">
        {message}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
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
        <TraceLine status="running">
          <TraceIcon>
            <StatusIcon status="running" />
          </TraceIcon>
          <TraceTitle>
            Generating image
            {part.input?.aspectRatio ? ` (${part.input.aspectRatio})` : ""}
          </TraceTitle>
        </TraceLine>
      );
    case "output-available": {
      if ("error" in part.output) {
        return <ImageGenerationError message={part.output.error} />;
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
      return <ImageGenerationError message={part.errorText} />;
    default:
      return null;
  }
}
