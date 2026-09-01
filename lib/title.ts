import "server-only";

import { generateText } from "ai";

import { DEFAULT_MODEL } from "@/lib/models";
import { getModel } from "@/lib/xai";

const NEW_CHAT_TITLE = "New chat";
const MAX_TITLE_LENGTH = 60;

export async function summarizeChatTitle(firstUserText: string) {
  const { text } = await generateText({
    model: getModel(DEFAULT_MODEL),
    system:
      "You write short chat titles. Summarize the user's first message into a concise title of at most 6 words. No quotes, no trailing punctuation, no prefix like 'Title:'.",
    prompt: firstUserText,
    maxOutputTokens: 30,
    temperature: 0,
  });

  const cleaned = text
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return NEW_CHAT_TITLE;
  return cleaned.length > MAX_TITLE_LENGTH
    ? `${cleaned.slice(0, MAX_TITLE_LENGTH - 3)}...`
    : cleaned;
}

export function isNewChatTitle(title: string) {
  return title === NEW_CHAT_TITLE;
}
