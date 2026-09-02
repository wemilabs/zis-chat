import { io } from "next/cache";
import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { Chat } from "@/components/chat";
import { ChatShell } from "@/components/chat-shell";
import { HomeSkeleton } from "@/components/loading-skeletons";
import { getCurrentUser } from "@/lib/current-user";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  await getCurrentUser();
  await io();
  const chatId = randomUUID();

  return (
    <ChatShell>
      <Chat
        chatId={chatId}
        initialMessages={[]}
        initialModel={DEFAULT_MODEL}
        isNew
        models={MODELS}
      />
    </ChatShell>
  );
}
