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
import { basename, dirname, join, relative, resolve } from "node:path";
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

/**
 * Backups and in-progress copies live beside the skills folder, never in it.
 * Harnesses load every directory inside a skills folder, so a backup kept
 * there would load as a second copy of the same skill.
 */
function workRoot(destination: string): string {
  return join(dirname(dirname(destination)), ".califa-skills");
}

function backupName(destination: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join(workRoot(destination), "backups", `${basename(destination)}-${timestamp}`);
}

/** Moves backups that older versions left inside a skills folder. */
export async function relocateLegacyBackups(skillsRoot: string): Promise<string[]> {
  const entries = await readdir(skillsRoot, { withFileTypes: true }).catch(() => []);
  const moved: string[] = [];
  for (const entry of entries) {
    const match = entry.name.match(/^(.+)\.califa-skills-backup-(.+)$/);
    if (!match) continue;
    const target = join(workRoot(join(skillsRoot, entry.name)), "backups", `${match[1]}-${match[2]}`);
    await mkdir(dirname(target), { recursive: true });
    await rename(join(skillsRoot, entry.name), target);
    moved.push(target);
  }
  return moved;
}

/**
 * A relative link survives moving or cloning a project, so a committed
 * .claude/skills link keeps working. Windows junctions must be absolute.
 */
function linkTarget(action: InstallAction): string {
  if (process.platform === "win32") return action.canonicalDestination;
  return relative(dirname(action.destination), action.canonicalDestination);
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
  await mkdir(join(workRoot(action.destination), "incoming"), { recursive: true });
  const incoming = join(
    workRoot(action.destination),
    "incoming",
    `${basename(action.destination)}-${process.pid}`,
  );
  await rm(incoming, { recursive: true, force: true });
  let copyFallback: string | undefined;
  if (action.kind === "link") {
    try {
      await symlink(
        linkTarget(action),
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
    await mkdir(dirname(backup), { recursive: true });
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
  const skillsRoots = new Set(plan.actions.map((action) => dirname(action.destination)));
  for (const root of skillsRoots) await relocateLegacyBackups(root);

  for (const action of plan.actions) {
    if (unchangedSet.has(action.destination)) continue;
    const result = await installAction(action, options.replace);
    installed.push(action);
    if (result.backup) backups.push(result.backup);
    if (result.copyFallback) copyFallbacks.push(result.copyFallback);
  }
  return { installed, backups, copyFallbacks };
}
