# websearch

A CLI that performs web search using the API keys of multiple providers behind a
single, unified interface. Bring whichever provider key you already have and
search the web from your terminal.

## Providers

`websearch` normalizes two fundamentally different kinds of "web search":

| Provider | Kind                                        | Output                           |
| -------- | ------------------------------------------- | -------------------------------- |
| `google` | SERP-style (Google Custom Search)           | a ranked list of links           |
| `openai` | LLM-grounded (Responses API `web_search`)   | a synthesized answer + citations |
| `gemini` | LLM-grounded (Grounding with Google Search) | a synthesized answer + citations |

The Gemini provider supports two backends that share the same request/response
shape: the **Gemini Developer API** (`gemini-api`, default) and **Vertex AI
express mode** (`vertex-express`).

## Install / build

```bash
pnpm install
pnpm build      # emits dist/, exposes the `websearch` bin
```

During development you can run without building via `pnpm start -- <args>`.

## Usage

```bash
websearch <query> --provider <openai|google|gemini> [options]
```

Options:

| Flag                    | Description                                 |
| ----------------------- | ------------------------------------------- |
| `-p, --provider <name>` | `openai` \| `google` \| `gemini` (required) |
| `-n, --max-results <n>` | Desired number of results (SERP providers)  |
| `-m, --model <name>`    | Model override (`openai`, `gemini`)         |
| `--gemini-backend <b>`  | `gemini-api` (default) \| `vertex-express`  |
| `--json`                | Emit normalized JSON instead of text        |
| `--raw`                 | Include the provider's raw response         |
| `-h, --help`            | Show help                                   |

Examples:

```bash
websearch "best static site generators 2026" -p google -n 5
websearch "summarize the latest TypeScript release" -p openai
websearch "who won euro 2024" -p gemini --gemini-backend vertex-express --json
```

## Authentication

API keys are read from **environment variables only** (never from flags), so
they don't leak into shell history or process listings.

| Provider                  | Environment variables                                             |
| ------------------------- | ----------------------------------------------------------------- |
| `openai`                  | `OPENAI_API_KEY`                                                  |
| `google`                  | `GOOGLE_API_KEY`, `GOOGLE_CSE_CX` (Programmable Search Engine ID) |
| `gemini` (gemini-api)     | `GEMINI_API_KEY` (falls back to `GOOGLE_API_KEY`)                 |
| `gemini` (vertex-express) | `VERTEX_API_KEY`                                                  |

## Caveats

- **Google Custom Search is closed to new customers.** Existing customers must
  migrate before 2027-01-01. Treat this provider as the most at-risk.
- **Google Custom Search returns at most 100 results** (10 per request); large
  `--max-results` values paginate and consume more quota.
- **Gemini grounding requires displaying Google Search Suggestions** per its
  terms. As a CLI we surface the queries the model ran on the `Searches:` line;
  the source URIs Gemini returns are temporary redirect links.

## Development

```bash
pnpm cicheck      # format check, lint, typecheck, tests, spelling, secrets
```
