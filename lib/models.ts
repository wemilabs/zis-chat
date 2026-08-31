// See https://docs.x.ai/docs/models.
export const MODELS = [
  { id: "grok-4.5", name: "Grok 4.5" },
  { id: "grok-4.6", name: "Grok 4.6" },
];

export const DEFAULT_MODEL = MODELS[0].id;

export interface ChatModel {
  id: string;
  name: string;
}

export function isModelAllowed(id: string) {
  return MODELS.some((model) => model.id === id);
}
