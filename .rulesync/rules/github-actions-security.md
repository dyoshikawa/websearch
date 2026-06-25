---
root: false
targets: ["*"]
description: "Security guidance for GitHub Actions workflows."
globs: [".github/workflows/*.yml"]
---

# GitHub Actions Security: Script Injection

When working with GitHub Actions workflows, ensure that untrusted inputs are never
interpolated directly into `run` scripts or other execution contexts.

- Do not inject untrusted inputs into shell commands (e.g. `run: echo ${{ github.event.issue.title }}`).
- Prefer passing untrusted data through environment variables and reference them safely.
- Use explicit quoting and safe parameter handling.
- Validate or sanitize inputs before use when feasible.

Reference: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
