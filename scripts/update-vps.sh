#!/usr/bin/env bash
# Updates the wall on the VPS (see PANDUAN-VPS.md): back up the settings database, pull main,
# install, build, restart only the wall's PM2 process, then check it answers.
# Run from anywhere: bash scripts/update-vps.sh
# Optional: PM2_NAME (default altama-milestone), WALL_PORT (default 3310),
# BACKUP_DIR (default ~/backup-altama, keeps the newest 30 copies).
# The settings database (.data/altama.sqlite) is git-ignored: nothing here deletes or resets it.
set -euo pipefail

main() {
  cd "$(dirname "$0")/.."
  local name="${PM2_NAME:-altama-milestone}"
  local port="${WALL_PORT:-3310}"
  local db=".data/altama.sqlite"
  local backups="${BACKUP_DIR:-$HOME/backup-altama}"

  if [ -f "$db" ]; then
    mkdir -p "$backups"
    local copy="$backups/altama-$(date +%Y%m%d-%H%M%S).sqlite"
    cp "$db" "$copy"
    echo "==> settings database backed up to $copy"
    ls -1t "$backups"/altama-*.sqlite | tail -n +31 | xargs -r rm --
  fi

  echo "==> git pull"
  git pull --ff-only
  echo "==> bun install"
  bun install --frozen-lockfile
  echo "==> bun run build"
  bun run build
  echo "==> pm2 restart ${name}"
  pm2 restart "${name}" --update-env
  sleep 2
  echo "==> check http://127.0.0.1:${port}"
  curl -sI "http://127.0.0.1:${port}" | head -1
}

# One line on purpose: bash has read the whole script before `git pull` can change this file.
main "$@"; exit
