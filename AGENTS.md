Please also reference the following rules as needed. The list below is provided in TOON format, and `@` stands for the project root directory.

rules[3]:
  - path: @.opencode/memories/coding-guidelines.md
    description: "When you write any code, follow these guidelines."
    applyTo[1]: **/*.ts
  - path: @.opencode/memories/github-actions-security.md
    description: Security guidance for GitHub Actions workflows.
    applyTo[1]: .github/workflows/*.yml
  - path: @.opencode/memories/testing-guidelines.md
    description: "When you write tests, follow these guidelines."
    applyTo[2]: **/*.test.ts,src/e2e/**/*.spec.ts

# Project Overview

<!-- TODO: one-paragraph description of what websearch is. -->

- Read `README.md` and any docs under `docs/**/*.md` to understand the project.
- Manage runtimes and package managers with `mise.toml`.
- When you want to check the entire codebase:
  - `pnpm cicheck:code` checks code style, type safety, and tests.
  - `pnpm cicheck:content` checks spelling and secrets.
  - `pnpm cicheck` runs both. Prefer `pnpm cicheck` for routine checks.
- When doing `git commit`:
  - Run `pnpm cicheck` before committing to verify quality.
  - Do not use the `--no-verify` option; it skips pre-commit checks.
  - When creating a PR, include a link associating the PR with its issue.
- When reading or searching the codebase, prefer the Serena MCP server tools.
- Always preserve happy-path end-to-end test cases.
- When researching, if the built-in webfetch cannot retrieve a page (e.g. a SPA),
  use the `playwright-cli` skill instead.
