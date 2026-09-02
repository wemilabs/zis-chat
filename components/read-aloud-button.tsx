"use client";

import { LoaderCircleIcon, PauseIcon, Volume2Icon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

export function ReadAloudButton({ text }: { text: string }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = React.useRef<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");

  React.useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setStatus("playing");
    const onPause = () => {
      if (audio.ended) return;
      setStatus("paused");
    };
    const onEnded = () => setStatus("idle");
    const onError = () => setStatus("error");

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  async function handleClick() {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "playing") {
      audio.pause();
      return;
    }

    if (status === "paused") {
      await audio.play().catch(() => setStatus("error"));
      return;
    }

    if (!blobUrlRef.current) {
      setStatus("loading");
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error(`TTS failed: ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        audio.src = url;
      } catch {
        setStatus("error");
        return;
      }
    }

    audio.currentTime = 0;
    await audio.play().catch(() => setStatus("error"));
  }

  const label =
    status === "loading"
      ? "Generating audio…"
      : status === "playing"
        ? "Pause"
        : status === "paused"
          ? "Resume"
          : "Read aloud";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            onClick={handleClick}
          />
        }
      >
        {status === "loading" ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : status === "playing" ? (
          <PauseIcon />
        ) : (
          <Volume2Icon />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
