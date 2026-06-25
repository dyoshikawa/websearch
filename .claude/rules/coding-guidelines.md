---
paths:
  - "**/*.ts"
---

# Coding Guidelines

- If a function or constructor takes multiple arguments, pass them as a single object.
- When writing validation logic, prefer `zod` (or `zod/mini` to minimize bundle size).
- Always use static imports, not dynamic imports — easier for bundlers to tree-shake.
- TypeScript file names should be in kebab-case, including class implementation files.
- Do not create barrel (re-export index) files; import implementation files directly.
- When joining filesystem paths, always use `join` from `node:path` (Windows + Unix).
- For non-filesystem paths (API paths, generated content, gitignore entries), use
  `path.posix.join` to ensure forward slashes regardless of platform.
- Use a consistent error formatter when logging errors.
- For zod schemas representing external/evolving data, prefer a loose object schema.
