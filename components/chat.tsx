"use client";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ChatMessage } from "@/components/chat-message";
import { PromptForm } from "@/components/prompt-form";
import { QuestionCard } from "@/components/question-card";
import { Suggestions } from "@/components/suggestions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { authClient } from "@/lib/auth-client";
import type { ChatModel } from "@/lib/models";
import type { ChatUIMessage } from "@/tools";

export function Chat({
  chatId,
  initialMessages,
  initialModel,
  isNew = false,
  models,
}: {
  chatId: string;
  initialMessages: ChatUIMessage[];
  initialModel: string;
  isNew?: boolean;
  models: ChatModel[];
}) {
  const router = useRouter();
  const [model, setModel] = React.useState(initialModel);
  const [sessionError, setSessionError] = React.useState<Error>();
  const [isStarting, startTransition] = React.useTransition();

  const { messages, sendMessage, status, stop, error, addToolOutput } =
    useChat<ChatUIMessage>({
      id: chatId,
      messages: initialMessages,
      onFinish: () => {
        if (isNew) {
          router.replace(`/chat/${chatId}`);
          return;
        }
        router.refresh();
      },
      // Resume the conversation automatically once the user has answered the
      // ask_user questionnaire.
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

  const resolvedModel = models.some((item) => item.id === model)
    ? model
    : (models[0]?.id ?? "");
  const isBusy = isStarting || status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const pendingQuestion =
    lastMessage?.role === "assistant"
      ? lastMessage.parts.find(
          (part): part is Extract<typeof part, { type: "tool-ask_user" }> =>
            part.type === "tool-ask_user" &&
            (part.state === "input-streaming" ||
              part.state === "input-available"),
        )
      : undefined;

  function submitMessage(text: string) {
    startTransition(async () => {
      setSessionError(undefined);

      try {
        const session = await authClient.getSession();
        if (!session.data) {
          const anonymousSession = await authClient.signIn.anonymous();
          if (anonymousSession.error) {
            throw new Error(
              anonymousSession.error.message ??
                "Could not start guest session.",
            );
          }
        }

        await sendMessage({ text }, { body: { chatId, model: resolvedModel } });
      } catch (cause) {
        setSessionError(
          cause instanceof Error ? cause : new Error("Could not send message."),
        );
      }
    });
  }

  const requestError = sessionError ?? error;

  return (
    <div className="mx-auto flex min-h-0 w-full flex-1 flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>What can I help with?</EmptyTitle>
              <EmptyDescription>
                Pick a model and start chatting. Responses stream from Grok.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Suggestions onSelect={submitMessage} />
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <MessageScrollerProvider>
          <MessageScroller className="flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
                {messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === "user"}
                  >
                    <ChatMessage
                      message={message}
                      isStreaming={isBusy && message.id === lastMessage?.id}
                    />
                  </MessageScrollerItem>
                ))}
                {status === "submitted" && (
                  <MessageScrollerItem messageId="thinking">
                    <div className="flex shimmer items-center gap-2 px-3 text-sm text-muted-foreground">
                      Thinking…
                    </div>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
              {pendingQuestion && (
                <QuestionCard
                  part={pendingQuestion}
                  onAnswer={(toolCallId, answer) =>
                    addToolOutput({
                      tool: "ask_user",
                      toolCallId,
                      output: answer,
                      options: { body: { chatId, model: resolvedModel } },
                    })
                  }
                />
              )}
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-6 pb-6">
        {requestError && (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{requestError.message}</AlertDescription>
          </Alert>
        )}
        <PromptForm
          models={models}
          model={resolvedModel}
          onModelChange={setModel}
          isBusy={isBusy}
          onSubmit={submitMessage}
          onStop={() => stop()}
        />
      </div>
    </div>
  );
}
