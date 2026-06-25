/**
 * Happy-path end-to-end tests: drive the CLI exactly as a user would (argv +
 * env), with the network mocked. These must be preserved (see CLAUDE.md).
 */

import { describe, expect, it } from "vitest";

import { runCli } from "../cli.js";
import { createFakeFetch } from "../test-support/fake-fetch.js";

interface RunParams {
  argv: string[];
  env: NodeJS.ProcessEnv;
  body: unknown;
}

async function run(params: RunParams): Promise<{ code: number; out: string; err: string }> {
  const fake = createFakeFetch([{ body: params.body }]);
  let out = "";
  let err = "";
  const code = await runCli({
    argv: params.argv,
    env: params.env,
    fetchImpl: fake.fetchImpl,
    stdout: (text) => {
      out += text;
    },
    stderr: (text) => {
      err += text;
    },
  });
  return { code, out, err };
}

describe("websearch CLI (e2e)", () => {
  it("google: returns SERP results", async () => {
    const { code, out } = await run({
      argv: ["typescript", "-p", "google"],
      env: { GOOGLE_API_KEY: "k", GOOGLE_CSE_CX: "cx" },
      body: { items: [{ title: "TS", link: "https://ts.dev", snippet: "lang" }] },
    });
    expect(code).toBe(0);
    expect(out).toContain("TS");
    expect(out).toContain("https://ts.dev");
  });

  it("openai: returns a grounded answer", async () => {
    const { code, out } = await run({
      argv: ["news", "--provider", "openai"],
      env: { OPENAI_API_KEY: "sk" },
      body: {
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: "Today's news.", annotations: [] }],
          },
        ],
      },
    });
    expect(code).toBe(0);
    expect(out).toContain("Today's news.");
  });

  it("gemini (vertex-express): returns a grounded answer as JSON", async () => {
    const { code, out } = await run({
      argv: ["euro 2024", "-p", "gemini", "--gemini-backend", "vertex-express", "--json"],
      env: { VERTEX_API_KEY: "v" },
      body: { candidates: [{ content: { parts: [{ text: "Spain." }] } }] },
    });
    expect(code).toBe(0);
    expect(JSON.parse(out).answer).toBe("Spain.");
  });

  it("fails with exit code 2 when the provider is missing", async () => {
    const { code, err } = await run({
      argv: ["q"],
      env: {},
      body: {},
    });
    expect(code).toBe(2);
    expect(err).toContain("provider");
  });

  it("fails with a clear error when credentials are missing", async () => {
    const { code, err } = await run({
      argv: ["q", "-p", "openai"],
      env: {},
      body: {},
    });
    expect(code).toBe(1);
    expect(err).toContain("OPENAI_API_KEY");
  });
});
