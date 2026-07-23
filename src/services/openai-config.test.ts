import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { DEFAULT_OPENAI_MODEL, getOpenAIModel } from "../../api/openai-config";

describe("getOpenAIModel", () => {
  const originalModel = process.env.OPENAI_MODEL;

  afterEach(() => {
    if (originalModel === undefined) {
      delete process.env.OPENAI_MODEL;
    } else {
      process.env.OPENAI_MODEL = originalModel;
    }
  });

  it("defaults to gpt-4o-mini when OPENAI_MODEL is missing", () => {
    delete process.env.OPENAI_MODEL;
    expect(getOpenAIModel()).toBe(DEFAULT_OPENAI_MODEL);
  });

  it("defaults to gpt-4o-mini when OPENAI_MODEL is empty", () => {
    process.env.OPENAI_MODEL = "";
    expect(getOpenAIModel()).toBe(DEFAULT_OPENAI_MODEL);
  });

  it("uses OPENAI_MODEL from the environment when set", () => {
    process.env.OPENAI_MODEL = "gpt-4o";
    expect(getOpenAIModel()).toBe("gpt-4o");
  });
});
