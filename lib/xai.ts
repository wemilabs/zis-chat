import "server-only";

import { createXai } from "@ai-sdk/xai";

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.XAI_API_BASE_URL,
});

export function getModel(id: string) {
  return xai(id);
}
