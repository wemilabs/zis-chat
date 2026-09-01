import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { chat, message } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/current-user";
import { isNewChatTitle, summarizeChatTitle } from "@/lib/title";
import type { ChatUIMessage } from "@/tools";

const PAGE_SIZE = 15;

export async function listChatsPage({
  archived,
  offset,
  limit = PAGE_SIZE,
}: {
  archived: boolean;
  offset: number;
  limit?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { chats: [], hasMore: false };

  const chats = await db
    .select({ id: chat.id, title: chat.title, updatedAt: chat.updatedAt })
    .from(chat)
    .where(and(eq(chat.userId, user.id), eq(chat.archived, archived)))
    .orderBy(desc(chat.updatedAt))
    .limit(limit)
    .offset(offset);

  return { chats, hasMore: chats.length === limit };
}

export async function ensureOwnedChat({
  chatId,
  userId,
  model,
}: {
  chatId: string;
  userId: string;
  model: string;
}) {
  await db
    .insert(chat)
    .values({ id: chatId, userId, model })
    .onConflictDoNothing();

  const [ownedChat] = await db
    .select({ id: chat.id })
    .from(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    .limit(1);

  return Boolean(ownedChat);
}

export async function getUserMessageCount(userId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(message)
    .innerJoin(chat, eq(message.chatId, chat.id))
    .where(and(eq(chat.userId, userId), eq(message.role, "user")));

  return result?.value ?? 0;
}

export async function getOwnedChat(chatId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [ownedChat] = await db
    .select()
    .from(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, user.id)))
    .limit(1);

  if (!ownedChat) return null;

  const storedMessages = await db
    .select()
    .from(message)
    .where(eq(message.chatId, ownedChat.id))
    .orderBy(asc(message.position));

  return {
    ...ownedChat,
    messages: storedMessages.map(
      (stored): ChatUIMessage => ({
        id: stored.id,
        role: stored.role as ChatUIMessage["role"],
        parts: stored.parts,
      }),
    ),
  };
}

export async function deleteChat(chatId: string) {
  const user = await requireUser();
  await db
    .delete(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));
}

export async function setChatArchived(chatId: string, archived: boolean) {
  const user = await requireUser();
  await db
    .update(chat)
    .set({ archived, updatedAt: new Date() })
    .where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));
}

export async function saveChatMessages({
  chatId,
  userId,
  model,
  messages,
  generateTitle = false,
}: {
  chatId: string;
  userId: string;
  model: string;
  messages: ChatUIMessage[];
  generateTitle?: boolean;
}) {
  const title = generateTitle
    ? await resolveChatTitle({ chatId, userId, messages })
    : await getExistingTitle(chatId, userId);
  const [ownedChat] = await db
    .update(chat)
    .set({ model, title, updatedAt: new Date() })
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    .returning({ id: chat.id });

  if (!ownedChat) throw new Error("Chat not found.");

  for (const [position, item] of messages.entries()) {
    await db
      .insert(message)
      .values({
        id: item.id,
        chatId,
        role: item.role,
        parts: item.parts,
        position,
      })
      .onConflictDoUpdate({
        target: [message.chatId, message.id],
        set: {
          role: item.role,
          parts: item.parts,
          position,
        },
      });
  }

  await db
    .delete(message)
    .where(
      and(
        eq(message.chatId, chatId),
        sql`${message.position} >= ${messages.length}`,
      ),
    );
}

async function getExistingTitle(chatId: string, userId: string) {
  const [existing] = await db
    .select({ title: chat.title })
    .from(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    .limit(1);
  return existing?.title ?? "New chat";
}

async function resolveChatTitle({
  chatId,
  userId,
  messages,
}: {
  chatId: string;
  userId: string;
  messages: ChatUIMessage[];
}) {
  const existingTitle = await getExistingTitle(chatId, userId);
  if (!isNewChatTitle(existingTitle)) return existingTitle;

  const firstUserText = messages
    .find((item) => item.role === "user")
    ?.parts.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!firstUserText) return existingTitle;

  try {
    return await summarizeChatTitle(firstUserText);
  } catch {
    return firstUserText.length > 60
      ? `${firstUserText.slice(0, 57)}...`
      : firstUserText;
  }
}
