"use client";

import { LogInIcon } from "lucide-react";
import { useTransition } from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          disabled={isPending}
          tooltip="Sign in with Google"
          onClick={() =>
            startTransition(async () => {
              await authClient.signIn.social({
                provider: "google",
                callbackURL: window.location.pathname,
              });
            })
          }
        >
          <LogInIcon />
          <span>{isPending ? "Connecting..." : "Sign in with Google"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
