"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ChatListItem } from "@/components/chat-list";
import { deleteChat, listChatsPage, setChatArchived } from "@/lib/chats";

export async function deleteChatAction(chatId: string) {
  await deleteChat(chatId);
  redirect("/");
}

export async function archiveChatAction(chatId: string) {
  await setChatArchived(chatId, true);
  revalidatePath("/");
}

export async function unarchiveChatAction(chatId: string) {
  await setChatArchived(chatId, false);
  revalidatePath("/");
}

export async function loadMoreChatsAction({
  archived,
  offset,
}: {
  archived: boolean;
  offset: number;
}): Promise<{ chats: ChatListItem[]; hasMore: boolean }> {
  return listChatsPage({ archived, offset });
}
