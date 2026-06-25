---
paths:
  - "**/*.test.ts"
  - src/e2e/**/*.spec.ts
---

# Testing Guidelines

- Co-locate test files next to their implementation: `src/a.ts` → `src/a.test.ts`.
- To avoid polluting git-tracked files, point tests at a unified temp directory such
  as `./tmp/tests/projects/{RANDOM_STRING}` (project dir) or
  `./tmp/tests/home/{RANDOM_STRING}` (pseudo-home dir), via a shared helper.
- Do not call `process.chdir()` in unit tests — mock `process.cwd()` instead.
  (E2E tests may use `process.chdir()` since they simulate real usage.)
- Never modify files outside the test's project directory.
- Suppress logger output under `NODE_ENV=test`; to see logs, use `console.log` and
  run the test runner with `--silent=false`.
