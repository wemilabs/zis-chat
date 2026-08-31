import type { Metadata } from "next";
import { Suspense } from "react";

import { Chat } from "@/components/chat";
import { MODELS } from "@/lib/models";

export const metadata: Metadata = {
  title: "Zis Chat | Fastest, smooth AI chat with web search",
  description: "Powered by xAI Grok.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Chat models={MODELS} />
    </Suspense>
  );
}
