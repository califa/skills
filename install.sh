#!/usr/bin/env bash
set -euo pipefail

PACKAGE_SPEC="${CALIFA_SKILLS_PACKAGE_SPEC:-@califaco/skills@latest}"

if ! command -v node >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
  printf '%s\n' "califa/skills requires Node.js 20 or newer: https://nodejs.org" >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  printf '%s\n' "califa/skills requires Node.js 20 or newer. Found $(node --version)." >&2
  exit 1
fi

run_califa_skills() {
  npx --yes --package "$PACKAGE_SPEC" califa-skills "$@"
}

# A curl pipe owns stdin. Reattach it so the child process remains interactive.
if { exec 3<>/dev/tty; } 2>/dev/null; then
  run_califa_skills "$@" <&3
  exec 3>&-
else
  case " $* " in
    *" --yes "*|*" -y "*) run_califa_skills "$@" ;;
    *)
      printf '%s\n' "califa/skills needs a terminal. For automation, pass --yes with --all or skill names." >&2
      exit 1
      ;;
  esac
fi
