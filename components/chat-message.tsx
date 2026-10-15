"use client";

import { AskUserPart } from "@/components/parts/ask-user-part";
import { GithubRepoPart } from "@/components/parts/github-repo-part";
import { ImageGenerationPart } from "@/components/parts/image-generation-part";
import { ReasoningPart } from "@/components/parts/reasoning-part";
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
import { Trace } from "@/components/ui/trace";
import type { ChatMessagePart, ChatUIMessage } from "@/tools";

type StepPart = Extract<
  ChatMessagePart,
  {
    type:
      | "reasoning"
      | "tool-github_repo"
      | "tool-ask_user"
      | "tool-web_search";
  }
>;

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
  const reasoningParts = message.parts.filter(
    (part) => part.type === "reasoning",
  );

  return (
    <Message align="start">
      <MessageContent>
        {groupParts(message.parts).map((block, index) => {
          if (Array.isArray(block)) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable id, and message.parts is append-only, so index is stable.
              <Trace key={index} className="px-1.5">
                {block.map((part, partIndex) => {
                  switch (part.type) {
                    case "reasoning":
                      return (
                        <ReasoningPart
                          // biome-ignore lint/suspicious/noArrayIndexKey: reasoning parts have no stable id and their text mutates while streaming.
                          key={partIndex}
                          part={part}
                          isStreaming={isStreaming}
                          duration={
                            message.metadata?.reasoningDurations?.[
                              reasoningParts.indexOf(part)
                            ]
                          }
                        />
                      );
                    case "tool-github_repo":
                      return (
                        <GithubRepoPart
                          key={part.toolCallId}
                          part={part}
                          isStreaming={isStreaming}
                        />
                      );
                    case "tool-ask_user":
                      return <AskUserPart key={part.toolCallId} part={part} />;
                    case "tool-web_search":
                      return (
                        <WebSearchPart
                          key={part.toolCallId}
                          part={part}
                          isStreaming={isStreaming}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </Trace>
            );
          }

          switch (block.type) {
            case "text":
              // biome-ignore lint/suspicious/noArrayIndexKey: text parts have no stable id and their content mutates while streaming, so a content-based key would remount on every token. message.parts is append-only, so index is stable.
              return <TextPart key={index} part={block} />;
            case "tool-image_generation":
              return (
                <ImageGenerationPart key={block.toolCallId} part={block} />
              );
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

// Consecutive steps (reasoning, tool calls) share one Trace; text and images
// split them into separate runs.
function groupParts(parts: ChatMessagePart[]) {
  return mergeTextParts(parts).reduce<(ChatMessagePart | StepPart[])[]>(
    (blocks, part) => {
      if (part.type === "text") {
        if (part.text.trim()) {
          blocks.push(part);
        }
        return blocks;
      }

      if (!isStepPart(part)) {
        blocks.push(part);
        return blocks;
      }

      const last = blocks.at(-1);
      if (Array.isArray(last)) {
        last.push(part);
      } else {
        blocks.push([part]);
      }
      return blocks;
    },
    [],
  );
}

function isStepPart(part: ChatMessagePart): part is StepPart {
  // An unanswered question shows in the QuestionCard, not in the Trace.
  if (part.type === "tool-ask_user") {
    return part.state === "output-available";
  }

  return (
    part.type === "reasoning" ||
    part.type === "tool-github_repo" ||
    part.type === "tool-web_search"
  );
}

// Web search replies stream one text part per citation, so join them back
// into one markdown document.
function mergeTextParts(parts: ChatMessagePart[]) {
  return parts
    .filter((part) => part.type !== "source-url")
    .reduce<ChatMessagePart[]>((merged, part) => {
      const last = merged.at(-1);
      if (part.type === "text" && last?.type === "text") {
        merged[merged.length - 1] = { ...part, text: last.text + part.text };
        return merged;
      }
      merged.push(part);
      return merged;
    }, []);
}
