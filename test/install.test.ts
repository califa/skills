import assert from "node:assert/strict";
import { lstat, mkdir, readFile, readdir, readlink, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
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
      // Kept outside the skills folder so harnesses don't load it as a second skill.
      assert.equal(dirname(result.backups[0] as string), join(home, ".agents", ".califa-skills", "backups"));
      assert.deepEqual(await readdir(join(home, ".agents", "skills")), ["review"]);
    } finally {
      await created.cleanup();
    }
  });

  it("links project installs with a relative path", async () => {
    const { home, cwd, skills } = await setup();
    const claude = getHarness("claude");
    if (!claude) throw new Error("Harness fixture missing");
    const created = await createInstallPlan({
      skills,
      harnesses: [claude],
      scope: "project",
      strategy: "link",
      context: { home, cwd },
    });
    try {
      await executeInstallPlan(created.plan, { replace: false });
      const link = join(cwd, ".claude", "skills", "review");
      const target = await readlink(link);
      if (process.platform !== "win32") assert.equal(isAbsolute(target), false);
      assert.equal(resolve(dirname(link), target), join(cwd, ".agents", "skills", "review"));
      assert.deepEqual(await readdir(join(cwd, ".claude", "skills")), ["review"]);
    } finally {
      await created.cleanup();
    }
  });

  it("moves backups older versions left inside a skills folder", async () => {
    const { home, cwd, skills } = await setup();
    const codex = getHarness("codex");
    if (!codex) throw new Error("Harness fixture missing");
    const legacy = join(home, ".agents", "skills", "review.califa-skills-backup-2026-01-01T00-00-00-000Z");
    await mkdir(legacy, { recursive: true });
    await writeFile(join(legacy, "SKILL.md"), "old contents");
    const created = await createInstallPlan({
      skills,
      harnesses: [codex],
      scope: "user",
      strategy: "link",
      context: { home, cwd },
    });
    try {
      await executeInstallPlan(created.plan, { replace: false });
      assert.deepEqual(await readdir(join(home, ".agents", "skills")), ["review"]);
      assert.equal(
        await readFile(
          join(home, ".agents", ".califa-skills", "backups", "review-2026-01-01T00-00-00-000Z", "SKILL.md"),
          "utf8",
        ),
        "old contents",
      );
    } finally {
      await created.cleanup();
    }
  });
});
