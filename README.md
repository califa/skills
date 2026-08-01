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

califa/skills writes canonical skills to `.agents/skills`. Harnesses that support the open shared path use it directly. When Claude Code is detected, it receives a directory link to its native `.claude/skills` location. If links are unavailable, califa/skills falls back to a copy. Existing content is never silently deleted: conflicts require confirmation and are renamed to a timestamped `.califa-skills-backup-*` path before replacement.

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

You can also run the published package directly with `npx @califa/skills`, `npx @califa/skills --all`, or `npx @califa/skills ux-research`.

## Automation

The same installer works without prompts:

```bash
# Install every bundled skill for every detected harness
npx @califa/skills --all --yes

# Name specific skills positionally
npx @califa/skills ux-research --scope project --yes

# Or use the equivalent flag form
npx @califa/skills --skills ux-research --yes

# Preview without changing files
npx @califa/skills --all --dry-run --yes
```

Run `npx @califa/skills --help` for every option.

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
