import { parseArgs } from "node:util";
import type { InstallStrategy, Scope } from "./types.js";

export interface CliOptions {
  scope?: Scope;
  skillNames?: string[];
  all: boolean;
  strategy: InstallStrategy;
  force: boolean;
  yes: boolean;
  dryRun: boolean;
  help: boolean;
  version: boolean;
}

function commaList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseCliArgs(args: string[]): CliOptions {
  const parsed = parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      scope: { type: "string" },
      skills: { type: "string", short: "s" },
      all: { type: "boolean", default: false },
      copy: { type: "boolean", default: false },
      force: { type: "boolean", short: "f", default: false },
      yes: { type: "boolean", short: "y", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });
  const scopeValue = parsed.values.scope;
  if (scopeValue && scopeValue !== "user" && scopeValue !== "project") {
    throw new Error("--scope must be user or project.");
  }
  const positionalSkillNames = parsed.positionals;
  const optionSkillNames = commaList(parsed.values.skills) ?? [];
  const skillNames = [...new Set([...positionalSkillNames, ...optionSkillNames])];
  if (parsed.values.all && skillNames.length) {
    throw new Error("Use either --all or specific skill names, not both.");
  }
  return {
    scope: scopeValue as Scope | undefined,
    skillNames: skillNames.length ? skillNames : undefined,
    all: parsed.values.all ?? false,
    strategy: parsed.values.copy ? "copy" : "link",
    force: parsed.values.force ?? false,
    yes: parsed.values.yes ?? false,
    dryRun: parsed.values["dry-run"] ?? false,
    help: parsed.values.help ?? false,
    version: parsed.values.version ?? false,
  };
}
