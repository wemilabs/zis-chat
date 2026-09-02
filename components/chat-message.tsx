"use client";

import { AskUserPart } from "@/components/parts/ask-user-part";
import { GithubRepoPart } from "@/components/parts/github-repo-part";
import { SourcesPart } from "@/components/parts/sources-part";
import { TextPart } from "@/components/parts/text-part";
import { WebSearchPart } from "@/components/parts/web-search-part";
import { ReadAloudButton } from "@/components/read-aloud-button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import type { ChatUIMessage } from "@/tools";
import { ImageGenerationPart } from "./parts/image-generation-part";

export function ChatMessage({
  message,
  isStreaming = false,
}: {
  message: ChatUIMessage;
  isStreaming?: boolean;
}) {
  if (message.role === "user") {
    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent>
              {message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("")}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  const assistantText = message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("");

  return (
    <Message align="start">
      <MessageContent>
        {message.parts.map((part, index) => {
          switch (part.type) {
            case "text":
              // biome-ignore lint/suspicious/noArrayIndexKey: text parts have no stable id and their content mutates while streaming, so a content-based key would remount on every token. message.parts is append-only, so index is stable.
              return <TextPart key={index} part={part} />;
            case "tool-github_repo":
              return <GithubRepoPart key={part.toolCallId} part={part} />;
            case "tool-ask_user":
              return <AskUserPart key={part.toolCallId} part={part} />;
            case "tool-web_search":
              return <WebSearchPart key={part.toolCallId} part={part} />;
            case "tool-image_generation":
              return <ImageGenerationPart key={part.toolCallId} part={part} />;
            default:
              return null;
          }
        })}
        {!isStreaming && <SourcesPart parts={message.parts} />}
        {!isStreaming && assistantText.trim() && (
          <MessageFooter>
            <ReadAloudButton text={assistantText} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
