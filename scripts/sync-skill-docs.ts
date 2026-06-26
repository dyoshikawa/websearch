import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generates the published `webseek` skill from README.md.
 *
 * README.md is the single source of truth for how to use webseek. This script
 * extracts the user-facing sections and writes them to `skills/webseek/SKILL.md`
 * with skill frontmatter, so the skill never drifts from the documentation.
 * `scripts/check-skill-docs-sync.ts` enforces the sync in CI.
 */

const ROOT = process.cwd();
const README_PATH = join(ROOT, "README.md");
const SKILL_DIR = join(ROOT, "skills", "webseek");
const SKILL_TITLE = "webseek";

const FRONTMATTER = `---
name: webseek
description: >-
  Unified multi-provider web search via the webseek CLI, MCP server, and library
  (OpenAI, Google Custom Search, Gemini). Use when running a web search from the
  terminal, embedding web search into a program, or wiring webseek as an MCP
  web_search tool.
---`;

const GENERATED_NOTICE =
  "<!-- Generated from README.md by scripts/sync-skill-docs.ts. Do not edit by hand. -->";

/**
 * README `##` sections to include in the skill, in this order. Contributor-only
 * sections (Architecture, Development, Releasing) are intentionally excluded.
 */
const INCLUDED_SECTIONS = [
  "Providers",
  "Install",
  "CLI mode",
  "MCP server mode",
  "Library (programmatic API)",
  "Authentication",
  "Caveats",
] as const;

export type ReadmeSection = { heading: string; body: string };

/**
 * Split a README into its lead paragraph (intro) and its top-level (`##`)
 * sections. Nested `###` headings stay inside their parent section.
 */
export function parseReadme(readme: string): { intro: string; sections: ReadmeSection[] } {
  const lines = readme.split("\n");
  const sections: ReadmeSection[] = [];
  const introLines: string[] = [];
  let current: ReadmeSection | undefined;
  let seenTitle = false;

  for (const line of lines) {
    if (!seenTitle) {
      if (line.startsWith("# ")) {
        seenTitle = true;
      }
      continue;
    }

    const match = /^## (.+)$/.exec(line);
    if (match) {
      if (current) {
        sections.push(current);
      }
      current = { heading: (match[1] ?? "").trim(), body: "" };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
    } else {
      introLines.push(line);
    }
  }

  if (current) {
    sections.push(current);
  }

  return { intro: introLines.join("\n").trim(), sections };
}

/**
 * Build the full `skills/webseek/SKILL.md` content from a README string. Pure
 * (no I/O) so it can be unit-tested directly.
 */
export function buildSkillContent(readme: string): string {
  const { intro, sections } = parseReadme(readme);
  const bodyByHeading = new Map(sections.map((section) => [section.heading, section.body.trim()]));

  const parts: string[] = [FRONTMATTER, "", GENERATED_NOTICE, "", `# ${SKILL_TITLE}`, ""];

  if (intro) {
    parts.push(intro, "");
  }

  for (const heading of INCLUDED_SECTIONS) {
    const body = bodyByHeading.get(heading);
    if (body === undefined) {
      throw new Error(
        `README section "## ${heading}" not found. Update INCLUDED_SECTIONS in scripts/sync-skill-docs.ts to match README.md.`,
      );
    }
    parts.push(`## ${heading}`, "", body, "");
  }

  return `${parts.join("\n").trimEnd()}\n`;
}

export function syncSkillDocs(): void {
  const readme = readFileSync(README_PATH, "utf-8");
  const content = buildSkillContent(readme);
  mkdirSync(SKILL_DIR, { recursive: true });
  writeFileSync(join(SKILL_DIR, "SKILL.md"), content);
  // oxlint-disable-next-line no-console
  console.log(`Synced README.md to ${join("skills", "webseek", "SKILL.md")}`);
}

const entryPointPath = process.argv[1];
if (entryPointPath && fileURLToPath(import.meta.url) === entryPointPath) {
  syncSkillDocs();
}
