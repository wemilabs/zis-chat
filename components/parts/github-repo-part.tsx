import { ArrowUpRightIcon, GitForkIcon, StarIcon } from "lucide-react";

import { StatusIcon } from "@/components/status-icon";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { safeHttpUrl } from "@/lib/utils";
import type { GithubRepoToolPart } from "@/tools";

const formatCount = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
}).format;

export function GithubRepoPart({
  part,
  isStreaming,
}: {
  part: GithubRepoToolPart;
  isStreaming: boolean;
}) {
  const repo = part.input?.repo ?? "repository";

  if (part.state !== "output-available" && part.state !== "output-error") {
    const status = isStreaming ? "running" : "error";
    return (
      <TraceLine status={status}>
        <TraceIcon>
          <StatusIcon status={status} />
        </TraceIcon>
        <TraceTitle>
          {isStreaming ? "Looking up" : "Failed to look up"} {repo}
        </TraceTitle>
      </TraceLine>
    );
  }

  // The tool returns { error } instead of throwing, so both read the same.
  const output =
    part.state === "output-available" ? part.output : { error: part.errorText };

  if ("error" in output) {
    return (
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <StatusIcon status="error" />
            </TraceIcon>
            <TraceTitle>Failed to look up {repo}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent className="text-destructive">
          {output.error}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    );
  }

  const url = safeHttpUrl(output.url);

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine>
          <TraceIcon>
            <StatusIcon />
          </TraceIcon>
          <TraceTitle>Looked up {output.repo}</TraceTitle>
          <TraceDescription>{formatCount(output.stars)} stars</TraceDescription>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              {output.repo}
              <ArrowUpRightIcon className="size-3.5" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <span className="font-medium text-foreground">{output.repo}</span>
          )}
          <span className="flex items-center gap-1">
            <StarIcon className="size-3.5" />
            {formatCount(output.stars)}
          </span>
          <span className="flex items-center gap-1">
            <GitForkIcon className="size-3.5" />
            {formatCount(output.forks)}
          </span>
          {output.language && <span>{output.language}</span>}
        </div>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
