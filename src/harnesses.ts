import { access } from "node:fs/promises";
import { delimiter, dirname, join } from "node:path";
import process from "node:process";
import type { Harness, HarnessContext, Scope } from "./types.js";

const sharedRoot = (scope: Scope, context: HarnessContext) =>
  join(scope === "user" ? context.home : context.cwd, ".agents", "skills");

export const harnesses: Harness[] = [
  {
    id: "claude",
    label: "Claude Code",
    commands: ["claude"],
    markers: ({ home }) => [join(home, ".claude")],
    root: (scope, { cwd, home }) =>
      join(scope === "user" ? home : cwd, ".claude", "skills"),
    sharedStandard: false,
  },
  {
    id: "codex",
    label: "Codex",
    commands: ["codex"],
    markers: ({ home }) => [join(home, ".codex")],
    root: sharedRoot,
    sharedStandard: true,
  },
  {
    id: "cursor",
    label: "Cursor",
    commands: ["cursor"],
    markers: ({ home }) => [join(home, ".cursor")],
    root: sharedRoot,
    sharedStandard: true,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    commands: ["windsurf"],
    markers: ({ home }) => [
      join(home, ".codeium", "windsurf"),
      join(home, "Library", "Application Support", "Windsurf"),
    ],
    root: sharedRoot,
    sharedStandard: true,
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    commands: ["gemini"],
    markers: ({ home }) => [join(home, ".gemini")],
    root: sharedRoot,
    sharedStandard: true,
  },
  {
    id: "opencode",
    label: "OpenCode",
    commands: ["opencode"],
    markers: ({ home }) => [join(home, ".config", "opencode")],
    root: sharedRoot,
    sharedStandard: true,
  },
  {
    id: "amp",
    label: "Amp",
    commands: ["amp"],
    markers: ({ home }) => [join(home, ".config", "amp"), join(home, ".amp")],
    root: sharedRoot,
    sharedStandard: true,
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    commands: ["copilot"],
    markers: ({ home }) => [join(home, ".copilot")],
    root: sharedRoot,
    sharedStandard: true,
  },
];

export function canonicalRoot(scope: Scope, context: HarnessContext): string {
  return sharedRoot(scope, context);
}

export function getHarness(id: string): Harness | undefined {
  return harnesses.find((harness) => harness.id === id);
}

export function displayPath(path: string, context: HarnessContext): string {
  if (path === context.home) return "~";
  if (path.startsWith(`${context.home}/`)) return `~/${path.slice(context.home.length + 1)}`;
  if (path === context.cwd) return ".";
  if (path.startsWith(`${context.cwd}/`)) return `./${path.slice(context.cwd.length + 1)}`;
  return path;
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  );
}

async function commandExists(command: string): Promise<boolean> {
  const pathEntries = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const entry of pathEntries) {
    for (const extension of extensions) {
      if (await exists(join(entry, `${command}${extension}`))) return true;
    }
  }
  return false;
}

export async function detectHarnesses(context: HarnessContext): Promise<string[]> {
  const detected: string[] = [];
  for (const harness of harnesses) {
    const roots = harness.markers(context);
    const markerFound = (await Promise.all(roots.map(exists))).some(Boolean);
    const commandFound = (
      await Promise.all(harness.commands.map(commandExists))
    ).some(Boolean);
    if (markerFound || commandFound) detected.push(harness.id);
  }
  return detected;
}

export function uniqueInstallRoots(
  selected: Harness[],
  scope: Scope,
  context: HarnessContext,
): Map<string, string[]> {
  const roots = new Map<string, string[]>();
  for (const harness of selected) {
    const root = harness.root(scope, context);
    roots.set(root, [...(roots.get(root) ?? []), harness.id]);
  }
  return roots;
}

export function markerParent(harness: Harness, context: HarnessContext): string[] {
  return harness.markers(context).map(dirname);
}
