import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rename,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { canonicalRoot, uniqueInstallRoots } from "./harnesses.js";
import type {
  Harness,
  HarnessContext,
  InstallAction,
  InstallPlan,
  InstallResult,
  InstallStrategy,
  Scope,
  Skill,
} from "./types.js";

const ignoredNames = new Set([".git", ".DS_Store", "node_modules"]);

async function pathState(path: string): Promise<"missing" | "directory" | "symlink" | "other"> {
  return lstat(path).then(
    (value) => {
      if (value.isSymbolicLink()) return "symlink";
      if (value.isDirectory()) return "directory";
      return "other";
    },
    () => "missing",
  );
}

async function directoryDigest(directory: string): Promise<string> {
  const hash = createHash("sha256");
  async function walk(current: string): Promise<void> {
    const entries = (await readdir(current, { withFileTypes: true }))
      .filter((entry) => !ignoredNames.has(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const path = join(current, entry.name);
      const relativePath = relative(directory, path);
      const type = entry.isDirectory() ? "d" : entry.isSymbolicLink() ? "l" : "f";
      hash.update(`${type}:${relativePath}\0`);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isSymbolicLink()) hash.update(await readlink(path));
      else if (entry.isFile()) hash.update(await readFile(path));
    }
  }
  await walk(directory);
  return hash.digest("hex");
}

async function isUnchanged(action: InstallAction): Promise<boolean> {
  const state = await pathState(action.destination);
  if (state === "missing") return false;
  if (action.kind === "link" && state === "symlink") {
    const target = await readlink(action.destination);
    return resolve(dirname(action.destination), target) === resolve(action.canonicalDestination);
  }
  if ((action.kind === "canonical" || action.kind === "copy") && state === "directory") {
    const [sourceDigest, destinationDigest] = await Promise.all([
      directoryDigest(action.source),
      directoryDigest(action.destination),
    ]);
    return sourceDigest === destinationDigest;
  }
  return false;
}

async function stageSkills(skills: Skill[]): Promise<{ skills: Skill[]; cleanup: () => Promise<void> }> {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "califa-skills-stage-"));
  const staged: Skill[] = [];
  for (const skill of skills) {
    const directory = join(temporaryRoot, skill.name);
    await cp(skill.directory, directory, {
      recursive: true,
      filter: (source) => !ignoredNames.has(source.split(/[\\/]/).at(-1) ?? ""),
    });
    staged.push({
      ...skill,
      directory,
      skillFile: join(directory, "SKILL.md"),
    });
  }
  return {
    skills: staged,
    cleanup: () => rm(temporaryRoot, { recursive: true, force: true }),
  };
}

export interface CreatePlanOptions {
  skills: Skill[];
  harnesses: Harness[];
  scope: Scope;
  strategy: InstallStrategy;
  context: HarnessContext;
}

export async function createInstallPlan(options: CreatePlanOptions): Promise<{
  plan: InstallPlan;
  cleanup: () => Promise<void>;
}> {
  const staged = await stageSkills(options.skills);
  const root = canonicalRoot(options.scope, options.context);
  const roots = uniqueInstallRoots(
    options.harnesses,
    options.scope,
    options.context,
  );
  if (!roots.has(root)) roots.set(root, []);

  const actions: InstallAction[] = [];
  for (const skill of staged.skills) {
    const canonicalDestination = join(root, skill.name);
    actions.push({
      kind: "canonical",
      skill,
      source: skill.directory,
      destination: canonicalDestination,
      canonicalDestination,
      harnessIds: roots.get(root) ?? [],
    });
    for (const [installRoot, harnessIds] of roots) {
      if (installRoot === root) continue;
      actions.push({
        kind: options.strategy === "copy" ? "copy" : "link",
        skill,
        source: skill.directory,
        destination: join(installRoot, skill.name),
        canonicalDestination,
        harnessIds,
      });
    }
  }

  const conflicts: InstallPlan["conflicts"] = [];
  const unchanged: InstallAction[] = [];
  for (const action of actions) {
    const state = await pathState(action.destination);
    if (state === "missing") continue;
    if (await isUnchanged(action)) unchanged.push(action);
    else conflicts.push({ action, reason: `Existing ${state} has different contents.` });
  }

  return {
    plan: {
      actions,
      conflicts,
      unchanged,
      canonicalRoot: root,
      selectedHarnesses: options.harnesses,
      strategy: options.strategy,
    },
    cleanup: staged.cleanup,
  };
}

function backupName(destination: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${destination}.califa-skills-backup-${timestamp}`;
}

async function installAction(
  action: InstallAction,
  replace: boolean,
): Promise<{ backup?: string; copyFallback?: string }> {
  if (await isUnchanged(action)) return {};
  const state = await pathState(action.destination);
  if (state !== "missing" && !replace) {
    throw new Error(`${action.destination} already exists with different contents.`);
  }

  await mkdir(dirname(action.destination), { recursive: true });
  const incoming = `${action.destination}.califa-skills-incoming-${process.pid}`;
  await rm(incoming, { recursive: true, force: true });
  let copyFallback: string | undefined;
  if (action.kind === "link") {
    try {
      await symlink(
        action.canonicalDestination,
        incoming,
        process.platform === "win32" ? "junction" : "dir",
      );
    } catch {
      await cp(action.canonicalDestination, incoming, { recursive: true });
      copyFallback = action.destination;
    }
  } else {
    const source = action.kind === "copy" ? action.canonicalDestination : action.source;
    await cp(source, incoming, { recursive: true });
  }

  let backup: string | undefined;
  if (state !== "missing") {
    backup = backupName(action.destination);
    await rename(action.destination, backup);
  }
  try {
    await rename(incoming, action.destination);
  } catch (error) {
    await rm(incoming, { recursive: true, force: true });
    if (backup) await rename(backup, action.destination);
    throw error;
  }
  return { backup, copyFallback };
}

export async function executeInstallPlan(
  plan: InstallPlan,
  options: { replace: boolean; dryRun?: boolean },
): Promise<InstallResult> {
  if (options.dryRun) return { installed: [], backups: [], copyFallbacks: [] };
  const installed: InstallAction[] = [];
  const backups: string[] = [];
  const copyFallbacks: string[] = [];
  const unchangedSet = new Set(plan.unchanged.map((action) => action.destination));

  for (const action of plan.actions) {
    if (unchangedSet.has(action.destination)) continue;
    const result = await installAction(action, options.replace);
    installed.push(action);
    if (result.backup) backups.push(result.backup);
    if (result.copyFallback) copyFallbacks.push(result.copyFallback);
  }
  return { installed, backups, copyFallbacks };
}
