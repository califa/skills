import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { discoverSkills, parseSkillFile } from "../src/discovery.js";

const roots: string[] = [];

async function temporaryRoot(name: string): Promise<string> {
  const root = join(tmpdir(), `califa-skills-test-${process.pid}-${Date.now()}-${name}`);
  roots.push(root);
  await mkdir(root, { recursive: true });
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("skill discovery", () => {
  it("discovers multiple nested skills and reads metadata", async () => {
    const root = await temporaryRoot("discover");
    await mkdir(join(root, "skills", "code-review"), { recursive: true });
    await mkdir(join(root, "skills", "release"), { recursive: true });
    await writeFile(
      join(root, "skills", "code-review", "SKILL.md"),
      "---\nname: code-review\ndescription: Review code carefully.\n---\n\n# Review\n",
    );
    await writeFile(
      join(root, "skills", "release", "SKILL.md"),
      "---\nname: release\ndescription: Prepare a release.\n---\n\n# Release\n",
    );

    const skills = await discoverSkills(root);
    assert.deepEqual(skills.map((skill) => skill.name), ["code-review", "release"]);
    assert.equal(skills[0]?.description, "Review code carefully.");
  });

  it("rejects a missing frontmatter block", () => {
    assert.throws(
      () => parseSkillFile("# Not a skill", "/tmp/SKILL.md"),
      /must begin with YAML frontmatter/,
    );
  });
});
