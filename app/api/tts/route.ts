import { generateSpeech } from "ai";

import { getCurrentUser } from "@/lib/current-user";
import { toPlainText } from "@/lib/plain-text";
import { getSpeechModel } from "@/lib/xai";

export const maxDuration = 30;

const MAX_INPUT_CHARS = 15000;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawText = (body as { text?: unknown })?.text;
  if (typeof rawText !== "string") {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }

  const text = toPlainText(rawText).slice(0, MAX_INPUT_CHARS);
  if (!text) {
    return Response.json({ error: "Nothing to read aloud." }, { status: 400 });
  }

  const result = await generateSpeech({
    model: getSpeechModel(),
    text,
    voice: "eve",
    language: "auto",
    outputFormat: "mp3",
  });

  const bytes = result.audio.uint8Array;
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return new Response(buffer, {
    headers: {
      "Content-Type": result.audio.mediaType ?? "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
