import { generateImage, tool } from "ai";
import { z } from "zod";

import { getImageModel } from "@/lib/xai";

const ASPECT_RATIOS = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "2:3",
  "3:2",
  "2:1",
  "1:2",
] as const;

export const imageGeneration = tool({
  description:
    "Generate an image from a text prompt using Grok Imagine. Use this when the user asks to create, draw, generate, or design an image. Describe the desired image in detail.",
  inputSchema: z.object({
    prompt: z
      .string()
      .min(1)
      .describe("A detailed description of the image to generate"),
    aspectRatio: z
      .enum(ASPECT_RATIOS)
      .default("1:1")
      .describe("The aspect ratio of the generated image"),
  }),
  outputSchema: z.union([
    z.object({ error: z.string() }),
    z.object({
      image: z.string().describe("The generated image as a base64 data URI"),
      prompt: z.string().describe("The prompt used to generate the image"),
    }),
  ]),
  execute: async ({ prompt, aspectRatio }, { abortSignal }) => {
    try {
      const result = await generateImage({
        model: getImageModel(),
        prompt,
        aspectRatio,
        n: 1,
        abortSignal,
      });

      const image = result.image;
      const dataUri = `data:${image.mediaType};base64,${image.base64}`;

      return { image: dataUri, prompt };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image generation failed.";
      return { error: message };
    }
  },
});
