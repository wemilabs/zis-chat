import { xai } from "@/lib/xai";

export function getWebSearch(_modelId: string) {
  return xai.tools.webSearch();
}
