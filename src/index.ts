#!/usr/bin/env node
import * as prompts from "@clack/prompts";
import { homedir } from "node:os";
import process from "node:process";
import pc from "picocolors";
import { parseCliArgs } from "./args.js";
import { bundledSkillsRoot } from "./bundled.js";
import { discoverSkills } from "./discovery.js";
import {
  detectHarnesses,
  displayPath,
  harnesses,
} from "./harnesses.js";
import { createInstallPlan, executeInstallPlan } from "./install.js";
import type { Harness, HarnessContext, Scope, Skill } from "./types.js";

const version = "0.1.0";
const title = pc.bold(pc.cyan("califa/skills"));

class UserCancelled extends Error {}

function help(): string {
  return `${title} ${pc.dim(`v${version}`)}

Install one or more Agent Skills across coding harnesses.

${pc.dim("Usage:")}
  califa-skills
  califa-skills --all
  califa-skills ux-research --scope project

${pc.dim("Options:")}
  -s, --skills <list>   Comma-separated skill names
      --all             Install every discovered skill
      --scope <scope>   user or project
      --copy            Copy into native roots instead of linking
  -f, --force           Back up and replace conflicts
  -y, --yes             Accept defaults without prompts
      --dry-run         Show the plan without changing files
  -h, --help            Show help
  -v, --version         Show version`;
}

function requireValue<T>(value: T | symbol): T {
  if (prompts.isCancel(value)) {
    prompts.cancel("Installation cancelled.");
    throw new UserCancelled();
  }
  return value as T;
}

function formatList(items: string[]): string {
  return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(items);
}

function formatSummaryList(items: string[], maximum = 5): string {
  if (items.length <= maximum) return formatList(items);
  return `${items.slice(0, maximum).join(", ")}, and ${items.length - maximum} more`;
}

function compactHint(value: string, maximum = 96): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  const clipped = normalized.slice(0, maximum - 1).replace(/\s+\S*$/, "");
  return `${clipped || normalized.slice(0, maximum - 1)}…`;
}

function selectSkills(available: Skill[], names: string[] | undefined): Skill[] {
  if (!names) return available;
  const wanted = new Set(names);
  const unknown = names.filter((name) => !available.some((skill) => skill.name === name));
  if (unknown.length) throw new Error(`Unknown skills: ${formatList(unknown)}.`);
  return available.filter((skill) => wanted.has(skill.name));
}

async function main(): Promise<void> {
  let options;
  try {
    options = parseCliArgs(process.argv.slice(2));
  } catch (error) {
    console.error(pc.red(error instanceof Error ? error.message : String(error)));
    console.error(`Run ${pc.cyan("califa-skills --help")} for usage.`);
    process.exitCode = 1;
    return;
  }
  if (options.help) {
    console.log(help());
    return;
  }
  if (options.version) {
    console.log(version);
    return;
  }

  const context: HarnessContext = { cwd: process.cwd(), home: homedir() };
  const interactive = process.stdin.isTTY && process.stdout.isTTY && !options.yes;
  if (!interactive && !options.all && !options.skillNames) {
    throw new Error("Use --all or name specific skills when prompts are unavailable.");
  }

  prompts.intro(`${title} ${pc.dim(`v${version}`)}`);
  let available: Skill[];
  const catalogSpinner = prompts.spinner();
  catalogSpinner.start("Loading bundled skills");
  try {
    available = await discoverSkills(bundledSkillsRoot());
    catalogSpinner.stop(`Found ${available.length} skill${available.length === 1 ? "" : "s"}`);
  } catch (error) {
    catalogSpinner.stop("Could not load bundled skills");
    throw error;
  }

  let selectedSkills = selectSkills(available, options.skillNames);
  if (!options.skillNames && !options.all && interactive && available.length > 1) {
    const selectionMode = requireValue(
      await prompts.select({
        message: "Which skills do you want to install?",
        options: [
          {
            value: "all",
            label: "Install all skills",
            hint: `${available.length} bundled`,
          },
          {
            value: "specific",
            label: "Choose specific skills",
            hint: "Select one or more by name",
          },
        ],
      }),
    );
    if (selectionMode === "specific") {
      const selectedNames = requireValue(
        await prompts.multiselect({
          message: "Which skills do you want to install?",
          options: available.map((skill) => ({
            value: skill.name,
            label: skill.name,
            hint: compactHint(skill.description),
          })),
          required: true,
        }),
      ) as string[];
      selectedSkills = selectSkills(available, selectedNames);
    }
  } else if (!options.skillNames && available.length === 1) {
    prompts.log.success(`Selected ${pc.cyan(available[0]?.name ?? "skill")}`);
  }

  for (const warning of selectedSkills.flatMap((skill) => skill.warnings)) {
    prompts.log.warn(warning);
  }

  const scope: Scope =
    options.scope ??
    (interactive
      ? requireValue(
          await prompts.select({
            message: "Where do you want to install these skills?",
            options: [
              { value: "user", label: "For me", hint: "Available in every project" },
              { value: "project", label: "Current project", hint: context.cwd },
            ],
          }),
        )
      : "user");

  const detectedIds = await detectHarnesses(context);
  const selected: Harness[] = harnesses.filter((harness) => detectedIds.includes(harness.id));
  if (selected.length) {
    prompts.log.success(`Detected ${formatList(selected.map((harness) => harness.label))}`);
  } else {
    prompts.log.warn("No supported harnesses detected. The shared copy will still be installed.");
  }

  const created = await createInstallPlan({
    skills: selectedSkills,
    harnesses: selected,
    scope,
    strategy: options.strategy,
    context,
  });
  try {
    const { plan } = created;
    const nativeTargets = new Set(
      plan.actions
        .filter((action) => action.kind !== "canonical")
        .map((action) => action.destination),
    ).size;
    prompts.note(
      [
        `${pc.cyan(String(selectedSkills.length))} skill${selectedSkills.length === 1 ? "" : "s"}: ${formatSummaryList(selectedSkills.map((skill) => skill.name))}`,
        selected.length
          ? `${pc.cyan(String(selected.length))} detected harness${selected.length === 1 ? "" : "es"}: ${formatList(selected.map((harness) => harness.label))}`
          : "No supported harnesses detected.",
        `Canonical store: ${pc.cyan(displayPath(plan.canonicalRoot, context))}`,
        nativeTargets
          ? `Native ${options.strategy === "link" ? "links" : "copies"}: ${pc.cyan(String(nativeTargets))}`
          : selected.length
            ? "All detected harnesses use the shared Agent Skills path."
            : "The shared copy will be ready for compatible harnesses.",
      ].join("\n"),
      options.dryRun ? "Dry run" : "Ready to install",
    );

    let replace = options.force;
    if (plan.conflicts.length && options.dryRun) {
      prompts.log.warn(
        `${plan.conflicts.length} existing destination${plan.conflicts.length === 1 ? " would" : "s would"} be backed up and replaced.`,
      );
    } else if (plan.conflicts.length && !replace) {
      prompts.log.warn(
        `${plan.conflicts.length} existing destination${plan.conflicts.length === 1 ? "" : "s"} will be backed up.`,
      );
      if (!interactive) {
        throw new Error("Conflicts found. Re-run with --force to back up and replace them.");
      }
      replace = requireValue(
        await prompts.confirm({
          message: "Back up and replace the conflicting destinations?",
          initialValue: true,
        }),
      );
      if (!replace) {
        prompts.cancel("No files were changed.");
        return;
      }
    }

    if (interactive && !options.dryRun) {
      const confirmed = requireValue(
        await prompts.confirm({ message: "Install now?", initialValue: true }),
      );
      if (!confirmed) {
        prompts.cancel("No files were changed.");
        return;
      }
    }

    if (options.dryRun) {
      prompts.outro("Dry run complete. No files were changed.");
      return;
    }

    const installSpinner = prompts.spinner();
    installSpinner.start("Installing skills");
    const result = await executeInstallPlan(plan, { replace });
    installSpinner.stop(
      `Installed ${selectedSkills.length} skill${selectedSkills.length === 1 ? "" : "s"}`,
    );
    if (result.backups.length) {
      prompts.log.info(
        `Created ${result.backups.length} backup${result.backups.length === 1 ? "" : "s"}.`,
      );
    }
    if (result.copyFallbacks.length) {
      prompts.log.warn(
        `Symlinks were unavailable for ${result.copyFallbacks.length} target${result.copyFallbacks.length === 1 ? "" : "s"}; copied instead.`,
      );
    }
    if (plan.unchanged.length) {
      prompts.log.info(
        `${plan.unchanged.length} destination${plan.unchanged.length === 1 ? " was" : "s were"} already current.`,
      );
    }
    prompts.outro(
      selected.length
        ? `All set. ${formatList(selected.map((harness) => harness.label))} can use your skills.`
        : `All set. Skills installed to ${displayPath(plan.canonicalRoot, context)}.`,
    );
  } finally {
    await created.cleanup();
  }
}

main().catch((error) => {
  if (error instanceof UserCancelled) return;
  prompts.log.error(error instanceof Error ? error.message : String(error));
  prompts.outro("Installation stopped.");
  process.exitCode = 1;
});
