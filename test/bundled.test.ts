import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resolve } from "node:path";
import { bundledSkillsRoot } from "../src/bundled.js";

const originalOverride = process.env.CALIFA_SKILLS_DIR;

afterEach(() => {
  if (originalOverride === undefined) delete process.env.CALIFA_SKILLS_DIR;
  else process.env.CALIFA_SKILLS_DIR = originalOverride;
});

describe("bundled skill catalog", () => {
  it("resolves the packaged skills directory by default", () => {
    delete process.env.CALIFA_SKILLS_DIR;
    assert.equal(bundledSkillsRoot(), resolve("skills"));
  });

  it("allows a development catalog override", () => {
    process.env.CALIFA_SKILLS_DIR = "./test-catalog";
    assert.equal(bundledSkillsRoot(), resolve("test-catalog"));
  });
});
