"use client";

import {
  ArchiveIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import * as React from "react";

import {
  archiveChatAction,
  deleteChatAction,
  unarchiveChatAction,
} from "@/app/actions/chats";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";

export function ChatMenu({
  chatId,
  chatTitle,
  archived,
}: {
  chatId: string;
  chatTitle: string;
  archived: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteAction = deleteChatAction.bind(null, chatId);
  const archiveAction = archiveChatAction.bind(null, chatId);
  const unarchiveAction = unarchiveChatAction.bind(null, chatId);

  return (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              showOnHover
              aria-label={`Options for ${chatTitle}`}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          {archived ? (
            <DropdownMenuItem onClick={() => unarchiveAction()}>
              <RotateCcwIcon />
              <span>Unarchive</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => archiveAction()}>
              <ArchiveIcon />
              <span>Archive</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete chat?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes “{chatTitle}” and its messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteAction}>
            <AlertDialogAction type="submit" variant="destructive">
              Delete
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
