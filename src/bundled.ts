import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export function bundledSkillsRoot(): string {
  const override = process.env.CALIFA_SKILLS_DIR?.trim();
  if (override) return resolve(override);
  return resolve(dirname(fileURLToPath(import.meta.url)), "..", "skills");
}
