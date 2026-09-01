"use client";

import { ChevronRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { ChatList, type ChatListItem } from "@/components/chat-list";
import { SignInButton } from "@/components/sign-in-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface SidebarUser {
  name: string;
  email: string;
  image?: string | null;
  isAnonymous?: boolean | null;
}

export function AppSidebar({
  activeChatId,
  recentChats,
  archivedChats,
  hasMoreRecent,
  hasMoreArchived,
  user,
}: {
  activeChatId?: string;
  recentChats: ChatListItem[];
  archivedChats: ChatListItem[];
  hasMoreRecent: boolean;
  hasMoreArchived: boolean;
  user: SidebarUser | null;
}) {
  const isSignedIn = user && !user.isAnonymous;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New chat" render={<Link href="/" />}>
              <PlusIcon />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel
              render={
                <CollapsibleTrigger
                  className="w-full"
                  aria-label="Toggle recent chats"
                />
              }
            >
              Recent
              <ChevronRightIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ChatList
                  activeChatId={activeChatId}
                  chats={recentChats}
                  archived={false}
                  hasMore={hasMoreRecent}
                />
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {archivedChats.length > 0 && (
          <Collapsible className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                render={
                  <CollapsibleTrigger
                    className="w-full"
                    aria-label="Toggle archived chats"
                  />
                }
              >
                Archived
                <ChevronRightIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <ChatList
                    activeChatId={activeChatId}
                    chats={archivedChats}
                    archived={true}
                    hasMore={hasMoreArchived}
                  />
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>
      <SidebarFooter>
        {isSignedIn ? <AccountMenu user={user} /> : <SignInButton />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
