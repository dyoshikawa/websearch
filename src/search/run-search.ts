/**
 * Resolves a provider by name, wires its config from the environment, and runs
 * the search. This is the seam between CLI argument parsing and the providers.
 */

import type { Env, GeminiBackend } from "../config/env.js";
import { resolveGeminiConfig, resolveGoogleCseConfig, resolveOpenAIConfig } from "../config/env.js";
import { WebsearchError } from "../errors/error-formatter.js";
import { createGeminiProvider } from "../providers/gemini.js";
import { createGoogleCseProvider } from "../providers/google-cse.js";
import { createOpenAIProvider } from "../providers/openai.js";
import type { NormalizedSearchResult, ProviderName } from "../providers/provider.js";

export interface RunSearchParams {
  provider: ProviderName;
  query: string;
  maxResults?: number;
  model?: string;
  includeRaw?: boolean;
  geminiBackend?: GeminiBackend;
  env?: Env;
  fetchImpl?: typeof fetch;
}

export function runSearch(params: RunSearchParams): Promise<NormalizedSearchResult> {
  const provider = resolveProvider(params);
  return provider.search({
    query: params.query,
    maxResults: params.maxResults,
    model: params.model,
    includeRaw: params.includeRaw,
    fetchImpl: params.fetchImpl,
  });
}

function resolveProvider(params: RunSearchParams) {
  switch (params.provider) {
    case "openai":
      return createOpenAIProvider({ config: resolveOpenAIConfig({ env: params.env }) });
    case "google":
      return createGoogleCseProvider({ config: resolveGoogleCseConfig({ env: params.env }) });
    case "gemini":
      return createGeminiProvider({
        config: resolveGeminiConfig({
          env: params.env,
          backend: params.geminiBackend ?? "gemini-api",
        }),
      });
    default:
      throw new WebsearchError({
        code: "invalid_usage",
        message: `Unknown provider: ${String(params.provider)}`,
      });
  }
}
