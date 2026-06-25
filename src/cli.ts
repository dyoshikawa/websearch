#!/usr/bin/env node
/**
 * websearch CLI entry point.
 *
 * Usage: websearch <query> [--provider <name>] [options]
 */

import { parseArgs } from "node:util";

import type { GeminiBackend } from "./config/env.js";
import { formatError, WebsearchError } from "./errors/error-formatter.js";
import { formatResult } from "./output/format.js";
import type { ProviderName } from "./providers/provider.js";
import { runSearch } from "./search/run-search.js";

const PROVIDERS: ReadonlySet<string> = new Set(["openai", "google", "gemini"]);
const GEMINI_BACKENDS: ReadonlySet<string> = new Set(["gemini-api", "vertex-express"]);

const HELP = `websearch — unified multi-provider web search

Usage:
  websearch <query> [options]

Options:
  -p, --provider <name>     Provider: openai | google | gemini   (required)
  -n, --max-results <num>   Desired number of results (SERP providers)
  -m, --model <name>        Model override (openai, gemini)
      --gemini-backend <b>  gemini backend: gemini-api (default) | vertex-express
      --json                Emit normalized JSON instead of text
      --raw                 Include the provider's raw response
  -h, --help                Show this help

Environment variables:
  openai   OPENAI_API_KEY
  google   GOOGLE_API_KEY, GOOGLE_CSE_CX
  gemini   GEMINI_API_KEY                      (gemini-api backend)
           VERTEX_API_KEY                      (vertex-express backend)

Notes:
  - Google Custom Search is closed to new customers; existing customers must
    migrate before 2027-01-01.
  - Gemini grounding requires displaying Google Search Suggestions; this CLI
    surfaces the queries it ran on the "Searches:" line.
`;

export interface RunCliParams {
  argv: string[];
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

export async function runCli(params: RunCliParams): Promise<number> {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args: params.argv,
      allowPositionals: true,
      options: {
        provider: { type: "string", short: "p" },
        "max-results": { type: "string", short: "n" },
        model: { type: "string", short: "m" },
        "gemini-backend": { type: "string" },
        json: { type: "boolean", default: false },
        raw: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (error) {
    params.stderr(formatError(error));
    return 2;
  }

  const { values, positionals } = parsed;

  if (values.help) {
    params.stdout(HELP);
    return 0;
  }

  try {
    const request = buildRequest({ values, positionals });
    const result = await runSearch({
      ...request,
      env: params.env,
      fetchImpl: params.fetchImpl,
    });
    params.stdout(formatResult({ result, json: Boolean(values.json) }));
    return 0;
  } catch (error) {
    params.stderr(formatError(error));
    return errorExitCode(error);
  }
}

interface BuildRequestParams {
  values: Record<string, unknown>;
  positionals: string[];
}

interface CliRequest {
  provider: ProviderName;
  query: string;
  maxResults?: number;
  model?: string;
  includeRaw?: boolean;
  geminiBackend?: GeminiBackend;
}

function buildRequest(params: BuildRequestParams): CliRequest {
  const query = params.positionals.join(" ").trim();
  if (!query) {
    throw new WebsearchError({ code: "invalid_usage", message: "Missing search query." });
  }

  const provider = params.values.provider;
  if (typeof provider !== "string" || !PROVIDERS.has(provider)) {
    throw new WebsearchError({
      code: "invalid_usage",
      message: "Missing or invalid --provider. Choose one of: openai, google, gemini.",
    });
  }

  const geminiBackend = params.values["gemini-backend"];
  if (geminiBackend !== undefined && !GEMINI_BACKENDS.has(String(geminiBackend))) {
    throw new WebsearchError({
      code: "invalid_usage",
      message: "Invalid --gemini-backend. Choose one of: gemini-api, vertex-express.",
    });
  }

  return {
    provider: provider as ProviderName,
    query,
    maxResults: parseMaxResults(params.values["max-results"]),
    model: typeof params.values.model === "string" ? params.values.model : undefined,
    includeRaw: Boolean(params.values.raw),
    geminiBackend: geminiBackend as GeminiBackend | undefined,
  };
}

function parseMaxResults(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new WebsearchError({
      code: "invalid_usage",
      message: "--max-results must be a positive integer.",
    });
  }
  return parsed;
}

function errorExitCode(error: unknown): number {
  if (error instanceof WebsearchError) {
    return error.code === "invalid_usage" ? 2 : 1;
  }
  return 1;
}

// Entry point when executed directly (not when imported by tests).
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runCli({
    argv: process.argv.slice(2),
    env: process.env,
    stdout: (text) => process.stdout.write(`${text}\n`),
    stderr: (text) => process.stderr.write(`${text}\n`),
  })
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      process.stderr.write(`${formatError(error)}\n`);
      process.exitCode = 1;
    });
}
