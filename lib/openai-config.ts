export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const normalizeEnvValue = (value: string | undefined): string =>
  (value ?? "").trim();

export const getOpenAIApiKey = (): string | undefined => {
  const apiKey = normalizeEnvValue(process.env.OPENAI_API_KEY);
  return apiKey || undefined;
};

export const getOpenAIModel = (): string => {
  const model = normalizeEnvValue(process.env.OPENAI_MODEL);
  if (!model || model === "undefined") {
    return DEFAULT_OPENAI_MODEL;
  }
  return model;
};
