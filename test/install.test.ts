import assert from "node:assert/strict";
import { lstat, mkdir, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, it } from "node:test";
import { discoverSkills } from "../src/discovery.js";
import { getHarness } from "../src/harnesses.js";
import { createInstallPlan, executeInstallPlan } from "../src/install.js";

const roots: string[] = [];

async function setup() {
  const root = join(tmpdir(), `califa-skills-install-${process.pid}-${Date.now()}`);
  roots.push(root);
  const home = join(root, "home");
  const cwd = join(root, "project");
  const source = join(root, "source", "review");
  await mkdir(source, { recursive: true });
  await mkdir(home, { recursive: true });
  await mkdir(cwd, { recursive: true });
  await writeFile(
    join(source, "SKILL.md"),
    "---\nname: review\ndescription: Review a change.\n---\n\n# Review\n",
  );
  const skills = await discoverSkills(source);
  return { root, home, cwd, source, skills };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("installation", () => {
  it("writes one canonical copy and links Claude Code", async () => {
    const { home, cwd, skills } = await setup();
    const codex = getHarness("codex");
    const claude = getHarness("claude");
    if (!codex || !claude) throw new Error("Harness fixture missing");
    const created = await createInstallPlan({
      skills,
      harnesses: [codex, claude],
      scope: "user",
      strategy: "link",
      context: { home, cwd },
    });
    try {
      await executeInstallPlan(created.plan, { replace: false });
      const canonical = join(home, ".agents", "skills", "review");
      const claudeTarget = join(home, ".claude", "skills", "review");
      assert.match(await readFile(join(canonical, "SKILL.md"), "utf8"), /name: review/);
      assert.equal((await lstat(claudeTarget)).isSymbolicLink(), true);
      assert.equal(resolve(join(claudeTarget, ".."), await readlink(claudeTarget)), canonical);
    } finally {
      await created.cleanup();
    }
  });

  it("backs up a conflicting canonical skill before replacing it", async () => {
    const { home, cwd, skills } = await setup();
    const codex = getHarness("codex");
    if (!codex) throw new Error("Harness fixture missing");
    const existing = join(home, ".agents", "skills", "review");
    await mkdir(existing, { recursive: true });
    await writeFile(join(existing, "SKILL.md"), "old contents");
    const created = await createInstallPlan({
      skills,
      harnesses: [codex],
      scope: "user",
      strategy: "link",
      context: { home, cwd },
    });
    try {
      assert.equal(created.plan.conflicts.length, 1);
      const result = await executeInstallPlan(created.plan, { replace: true });
      assert.equal(result.backups.length, 1);
      assert.match(await readFile(join(existing, "SKILL.md"), "utf8"), /name: review/);
      assert.equal(
        await readFile(join(result.backups[0] as string, "SKILL.md"), "utf8"),
        "old contents",
      );
    } finally {
      await created.cleanup();
    }
  });
});
