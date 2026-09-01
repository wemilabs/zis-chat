import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { listChatsPage } from "@/lib/chats";
import { getCurrentUser } from "@/lib/current-user";

export async function ChatShell({
  activeChatId,
  children,
}: {
  activeChatId?: string;
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const [recent, archived] =
    user !== null
      ? await Promise.all([
          listChatsPage({ archived: false, offset: 0 }),
          listChatsPage({ archived: true, offset: 0 }),
        ])
      : [
          { chats: [], hasMore: false },
          { chats: [], hasMore: false },
        ];

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        activeChatId={activeChatId}
        recentChats={recent.chats}
        archivedChats={archived.chats}
        hasMoreRecent={recent.hasMore}
        hasMoreArchived={archived.hasMore}
        user={user}
      />
      <SidebarInset className="h-svh min-h-0 overflow-hidden">
        <SidebarTrigger className="absolute top-3 left-3 z-40 bg-background shadow-sm" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
