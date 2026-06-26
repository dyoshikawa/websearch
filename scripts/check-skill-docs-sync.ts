import { execSync } from "node:child_process";

import { formatError } from "../src/utils/error.js";
import { syncSkillDocs } from "./sync-skill-docs.js";

/**
 * CI guard: regenerate the skill from README.md and fail if the committed
 * `skills/webseek/` differs from the freshly generated output.
 */
function main(): void {
  syncSkillDocs();

  try {
    execSync("git diff --exit-code -- skills/webseek", { stdio: "inherit" });
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.error(
      `skills/webseek/ is out of sync with README.md. Run "pnpm exec tsx scripts/sync-skill-docs.ts" and commit the result.\n${formatError(error)}`,
    );
    process.exit(1);
  }
}

main();
