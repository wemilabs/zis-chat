import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { Chat } from "@/components/chat";
import { ChatShell } from "@/components/chat-shell";
import { SavedChatSkeleton } from "@/components/loading-skeletons";
import { getOwnedChat } from "@/lib/chats";
import { MODELS } from "@/lib/models";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SavedChatSkeleton />}>
      <SavedChat params={params} />
    </Suspense>
  );
}

async function SavedChat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const savedChat = await getOwnedChat(id);
  if (!savedChat) notFound();

  return (
    <ChatShell activeChatId={savedChat.id}>
      <Chat
        chatId={savedChat.id}
        initialMessages={savedChat.messages}
        initialModel={savedChat.model}
        models={MODELS}
      />
    </ChatShell>
  );
}
