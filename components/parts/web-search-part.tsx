import { StatusIcon } from "@/components/status-icon";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import type { WebSearchToolPart } from "@/tools";

export function WebSearchPart({
  part,
  isStreaming,
}: {
  part: WebSearchToolPart;
  isStreaming: boolean;
}) {
  const query = part.state === "output-available" ? part.output?.query : "";
  const target = query ? `the web for “${query}”` : "the web";

  if (part.state === "output-available") {
    return (
      <TraceLine>
        <TraceIcon>
          <StatusIcon />
        </TraceIcon>
        <TraceTitle>Searched {target}</TraceTitle>
      </TraceLine>
    );
  }

  if (part.state === "output-error") {
    return (
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <StatusIcon status="error" />
            </TraceIcon>
            <TraceTitle>Failed to search {target}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent className="text-destructive">
          {part.errorText}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    );
  }

  const status = isStreaming ? "running" : "error";

  return (
    <TraceLine status={status}>
      <TraceIcon>
        <StatusIcon status={status} />
      </TraceIcon>
      <TraceTitle>
        {isStreaming ? "Searching" : "Failed to search"} {target}
      </TraceTitle>
    </TraceLine>
  );
}
