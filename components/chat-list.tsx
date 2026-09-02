"use client";

import Link from "next/link";
import * as React from "react";

import { loadMoreChatsAction } from "@/app/actions/chats";
import { ChatMenu } from "@/components/chat-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChatListItem {
  id: string;
  title: string;
}

export function ChatList({
  activeChatId,
  chats: initialChats,
  archived,
  hasMore: initialHasMore,
}: {
  activeChatId?: string;
  chats: ChatListItem[];
  archived: boolean;
  hasMore: boolean;
}) {
  const [chats, setChats] = React.useState(initialChats);
  const [hasMore, setHasMore] = React.useState(initialHasMore);
  const [isLoading, startLoading] = React.useTransition();
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const offset = chats.length;

  // IntersectionObserver is an external system — useEffect is correct here.
  // No useCallback needed: the compiler memoizes the callback automatically.
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (isLoading || !hasMore) return;
        startLoading(async () => {
          const result = await loadMoreChatsAction({ archived, offset });
          setChats((prev) => [...prev, ...result.chats]);
          setHasMore(result.hasMore);
        });
      },
      { rootMargin: "100px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [archived, offset, isLoading, hasMore]);

  if (chats.length === 0) {
    return (
      <p className="px-2 text-sm text-sidebar-foreground/70">
        {archived ? "No archived chats." : "No chats yet."}
      </p>
    );
  }

  return (
    <SidebarMenu>
      {chats.map((chat) => (
        <SidebarMenuItem key={chat.id}>
          <SidebarMenuButton
            isActive={chat.id === activeChatId}
            tooltip={chat.title}
            render={<Link href={`/chat/${chat.id}`} prefetch />}
          >
            <span className="truncate text-sm">{chat.title}</span>
          </SidebarMenuButton>
          <ChatMenu
            chatId={chat.id}
            chatTitle={chat.title}
            archived={archived}
          />
        </SidebarMenuItem>
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-2">
          {isLoading && <Skeleton className="h-5 w-3/4" />}
        </div>
      )}
    </SidebarMenu>
  );
}
