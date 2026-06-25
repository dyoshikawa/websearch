/**
 * Resolves provider credentials and configuration from environment variables.
 *
 * API keys are read from the environment only (never from CLI flags/args) so
 * they don't leak into shell history or process listings.
 */

import { WebsearchError } from "../errors/error-formatter.js";

export interface Env {
  [key: string]: string | undefined;
}

export interface ResolveOpenAIConfigParams {
  env?: Env;
}

export interface OpenAIConfig {
  apiKey: string;
}

export function resolveOpenAIConfig(params: ResolveOpenAIConfigParams = {}): OpenAIConfig {
  const env = params.env ?? process.env;
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new WebsearchError({
      code: "missing_config",
      message: "OPENAI_API_KEY is not set. Export it to use the openai provider.",
    });
  }
  return { apiKey };
}

export interface ResolveGoogleCseConfigParams {
  env?: Env;
}

export interface GoogleCseConfig {
  apiKey: string;
  cx: string;
}

export function resolveGoogleCseConfig(params: ResolveGoogleCseConfigParams = {}): GoogleCseConfig {
  const env = params.env ?? process.env;
  const apiKey = env.GOOGLE_API_KEY;
  const cx = env.GOOGLE_CSE_CX ?? env.GOOGLE_CSE_ID;
  if (!apiKey) {
    throw new WebsearchError({
      code: "missing_config",
      message: "GOOGLE_API_KEY is not set. Export it to use the google provider.",
    });
  }
  if (!cx) {
    throw new WebsearchError({
      code: "missing_config",
      message:
        "GOOGLE_CSE_CX is not set. Export your Programmable Search Engine ID to use the google provider.",
    });
  }
  return { apiKey, cx };
}

export type GeminiBackend = "gemini-api" | "vertex-express";

export interface ResolveGeminiConfigParams {
  env?: Env;
  backend: GeminiBackend;
}

export interface GeminiConfig {
  apiKey: string;
  backend: GeminiBackend;
}

export function resolveGeminiConfig(params: ResolveGeminiConfigParams): GeminiConfig {
  const env = params.env ?? process.env;
  const { backend } = params;

  if (backend === "vertex-express") {
    const apiKey = env.VERTEX_API_KEY;
    if (!apiKey) {
      throw new WebsearchError({
        code: "missing_config",
        message:
          "VERTEX_API_KEY is not set. Export it to use the gemini provider with the vertex-express backend.",
      });
    }
    return { apiKey, backend };
  }

  const apiKey = env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new WebsearchError({
      code: "missing_config",
      message: "GEMINI_API_KEY is not set. Export it to use the gemini provider.",
    });
  }
  return { apiKey, backend };
}
