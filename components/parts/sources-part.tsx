import { ArrowUpRightIcon, GlobeIcon } from "lucide-react";

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { safeHttpUrl } from "@/lib/utils";
import type { ChatMessagePart, SourceUrlPart } from "@/tools";

function getUniqueSources(parts: ChatMessagePart[]): SourceUrlPart[] {
  return parts
    .filter((part): part is SourceUrlPart => part.type === "source-url")
    .filter((source) => safeHttpUrl(source.url))
    .filter(
      (source, index, all) =>
        all.findIndex((other) => other.url === source.url) === index,
    );
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function SourcesPart({ parts }: { parts: ChatMessagePart[] }) {
  const sources = getUniqueSources(parts);

  if (sources.length === 0) {
    return null;
  }

  const count = sources.length;

  return (
    <Trace className="px-1.5">
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <GlobeIcon />
            </TraceIcon>
            <TraceTitle>
              Searched {count} {count === 1 ? "website" : "websites"}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <TraceLine>
                  <TraceIcon>
                    <GlobeIcon />
                  </TraceIcon>
                  <TraceTitle>
                    {source.title || getHostname(source.url)}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TraceTitle>
                  <TraceIcon>
                    <ArrowUpRightIcon />
                  </TraceIcon>
                </TraceLine>
              </a>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
