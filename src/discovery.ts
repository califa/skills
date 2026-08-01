import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Skill } from "./types.js";

const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);
const validSkillName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface SkillMetadata {
  name?: unknown;
  description?: unknown;
}

export function parseSkillFile(content: string, path: string): SkillMetadata {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match?.[1]) {
    throw new Error(`${path} must begin with YAML frontmatter.`);
  }

  const metadata = parseYaml(match[1]);
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`${path} has invalid YAML frontmatter.`);
  }
  return metadata as SkillMetadata;
}

async function findSkillFiles(root: string): Promise<string[]> {
  const rootStat = await stat(root);
  if (rootStat.isFile()) {
    if (basename(root) !== "SKILL.md") {
      throw new Error(`${root} is a file, but it is not named SKILL.md.`);
    }
    return [root];
  }

  const directSkill = join(root, "SKILL.md");
  if (
    await stat(directSkill).then(
      (value) => value.isFile(),
      () => false,
    )
  ) {
    return [directSkill];
  }

  const results: string[] = [];
  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile() && entry.name === "SKILL.md") {
        results.push(path);
      }
    }
  }
  await walk(root);
  return results;
}

export async function discoverSkills(root: string): Promise<Skill[]> {
  const absoluteRoot = resolve(root);
  const files = await findSkillFiles(absoluteRoot);
  if (files.length === 0) {
    throw new Error(`No SKILL.md files found in ${absoluteRoot}.`);
  }

  const skills = await Promise.all(
    files.map(async (skillFile): Promise<Skill> => {
      const content = await readFile(skillFile, "utf8");
      const metadata = parseSkillFile(content, skillFile);
      if (typeof metadata.name !== "string" || !validSkillName.test(metadata.name)) {
        throw new Error(
          `${skillFile} has an invalid name. Use lowercase letters, numbers, and single hyphens.`,
        );
      }
      if (
        typeof metadata.description !== "string" ||
        metadata.description.trim().length === 0 ||
        metadata.description.length > 1024
      ) {
        throw new Error(`${skillFile} needs a description between 1 and 1024 characters.`);
      }

      const directory = dirname(skillFile);
      const warnings: string[] = [];
      if (basename(directory) !== metadata.name) {
        warnings.push(
          `Folder ${basename(directory)} does not match skill name ${metadata.name}.`,
        );
      }
      return {
        name: metadata.name,
        description: metadata.description.trim(),
        directory,
        skillFile,
        relativeDirectory: relative(absoluteRoot, directory) || ".",
        warnings,
      };
    }),
  );

  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.name)) {
      const duplicates = skills
        .filter((candidate) => candidate.name === skill.name)
        .map((candidate) => candidate.relativeDirectory)
        .join(", ");
      throw new Error(
        `The source contains more than one skill named ${skill.name} (${duplicates}). Narrow the source to a subdirectory.`,
      );
    }
    seen.add(skill.name);
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}
