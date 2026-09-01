import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  validateUIMessages,
} from "ai";
import { z } from "zod";

import {
  ensureOwnedChat,
  getOwnedChat,
  getUserMessageCount,
  saveChatMessages,
} from "@/lib/chats";
import { getCurrentUser } from "@/lib/current-user";
import { DEFAULT_MODEL, isModelAllowed } from "@/lib/models";
import { getModel } from "@/lib/xai";
import { getTools, type ChatUIMessage } from "@/tools";

export const maxDuration = 30;

const MAX_OUTPUT_TOKENS = 8192;
const GUEST_MESSAGE_LIMIT = 5;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const chatId = (body as { chatId?: unknown })?.chatId;
  if (typeof chatId !== "string" || !z.uuid().safeParse(chatId).success) {
    return Response.json({ error: "Invalid chat ID." }, { status: 400 });
  }

  const savedChat = await getOwnedChat(chatId);
  const model = (body as { model?: unknown })?.model;
  const modelId =
    typeof model === "string" ? model : (savedChat?.model ?? DEFAULT_MODEL);

  if (!isModelAllowed(modelId)) {
    return Response.json(
      { error: `Model ${modelId} is not available.` },
      { status: 400 },
    );
  }

  const tools = getTools(modelId);
  let messages: ChatUIMessage[];

  try {
    messages = await validateUIMessages<ChatUIMessage>({
      messages: (body as { messages?: unknown })?.messages,
      tools: tools as Parameters<typeof validateUIMessages>[0]["tools"],
    });
  } catch {
    return Response.json({ error: "Invalid messages." }, { status: 400 });
  }

  const storedMessageIds = new Set(
    savedChat?.messages.map((message) => message.id) ?? [],
  );
  const newUserMessageCount = messages.filter(
    (message) => message.role === "user" && !storedMessageIds.has(message.id),
  ).length;

  if (user.isAnonymous && newUserMessageCount > 0) {
    const usedMessages = await getUserMessageCount(user.id);
    if (usedMessages + newUserMessageCount > GUEST_MESSAGE_LIMIT) {
      return Response.json(
        { error: "Guest limit reached. Sign in with Google to continue." },
        { status: 403 },
      );
    }
  }

  const ownsChat = await ensureOwnedChat({
    chatId,
    userId: user.id,
    model: modelId,
  });
  if (!ownsChat) {
    return Response.json({ error: "Chat not found." }, { status: 404 });
  }

  await saveChatMessages({
    chatId,
    userId: user.id,
    model: modelId,
    messages,
    generateTitle: false,
  });

  const result = streamText({
    model: getModel(modelId),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: isStepCount(5),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    abortSignal: req.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      sendSources: true,
      onEnd: async ({ messages: completedMessages }) => {
        await saveChatMessages({
          chatId,
          userId: user.id,
          model: modelId,
          messages: completedMessages,
          generateTitle: true,
        });
      },
      onError: () => "Something went wrong. Please try again.",
    }),
  });
}
