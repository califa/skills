# califa/skills

califa/skills is an interactive terminal installer for a bundled collection of [Agent Skills](https://agentskills.io). It detects your coding harnesses automatically and installs one canonical copy that stays shared across your tools.

```bash
curl -fsSL https://raw.githubusercontent.com/califa/skills/main/install.sh | bash
```

The curl endpoint serves [`install.sh`](./install.sh). It launches the packaged TUI and reconnects stdin to the terminal so the prompts remain interactive through a pipe.

The guided flow is deliberately short:

1. Install every bundled skill or choose specific skills by name.
2. Choose personal or project scope.
3. Review the detected harnesses and install.

califa/skills writes canonical skills to `.agents/skills`. Harnesses that support the open shared path use it directly. When Claude Code is detected, it receives a directory link to its native `.claude/skills` location. Project installs use relative links, so a committed `.claude/skills` link keeps working in other checkouts and CI. If links are unavailable, califa/skills falls back to a copy. Existing content is never silently deleted: conflicts require confirmation and are moved to a timestamped backup in `.califa-skills/backups/` beside the skills folder (never inside it, where agents would load it as a second skill).

## Other ways to install

Claude Code users can install the skills as a plugin and get updates through `/plugin`, with no Node.js needed:

```
/plugin install califa-skills --marketplace califa/skills
```

On Claude Code before 2.1.275, add the marketplace first: `/plugin marketplace add califa/skills`, then `/plugin install califa-skills@califa`.

The repository also follows the standard `skills/<name>/SKILL.md` layout, so other skill installers work with it, for example `npx skills add califa/skills`.

## Supported harnesses

| Harness | Personal skill location used by califa/skills |
| --- | --- |
| Claude Code | `~/.claude/skills` linked to the canonical copy |
| Codex | `~/.agents/skills` |
| Cursor | `~/.agents/skills` |
| Windsurf | `~/.agents/skills` |
| Gemini CLI | `~/.agents/skills` |
| OpenCode | `~/.agents/skills` |
| Amp | `~/.agents/skills` |
| GitHub Copilot | `~/.agents/skills` |

Project installs use the equivalent directory inside the current project.

## Choose skills from the command

```bash
# Open the interactive installer
curl -fsSL https://raw.githubusercontent.com/califa/skills/main/install.sh | bash

# Install every bundled skill
curl -fsSL https://raw.githubusercontent.com/califa/skills/main/install.sh | bash -s -- --all

# Name one or more bundled skills, ui.sh style
curl -fsSL https://raw.githubusercontent.com/califa/skills/main/install.sh | bash -s -- ux-research
```

You can also run the published package directly with `npx @califaco/skills`, `npx @califaco/skills --all`, or `npx @califaco/skills ux-research`.

## Automation

The same installer works without prompts:

```bash
# Install every bundled skill for every detected harness
npx @califaco/skills --all --yes

# Name specific skills positionally
npx @califaco/skills ux-research --scope project --yes

# Or use the equivalent flag form
npx @califaco/skills --skills ux-research --yes

# Preview without changing files
npx @califaco/skills --all --dry-run --yes
```

Run `npx @califaco/skills --help` for every option.

## Development

Add the skills you want to ship under [`skills/`](./skills), one directory per skill. The entire directory is included in the npm package.

```bash
npm install
npm run dev
npm run dev -- ux-research
npm test
npm run lint
npm run build
```

califa/skills requires Node.js 20 or newer.

## Releasing

1. Bump `version` in `package.json` and `.claude-plugin/plugin.json` (the publish workflow checks they match).
2. Merge to main, then tag and push: `git tag v0.2.0 && git push origin v0.2.0`.
3. The Publish workflow runs the tests and publishes to npm with a provenance attestation.

The workflow uses npm trusted publishing. Before the first tagged release, add a trusted publisher on npmjs.com (package settings, Trusted publishing: GitHub Actions, repository `califa/skills`, workflow `publish.yml`, environment `npm`).
