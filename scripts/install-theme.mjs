#!/usr/bin/env node
/**
 * Install the VERDICT opencode theme user-wide so the TUI finds it regardless of
 * which case directory the harness runs against.
 *
 * Copies `.opencode/themes/verdict.json` -> `$XDG_CONFIG_HOME/opencode/themes/`
 * (falling back to `~/.config/opencode/themes/`). Path-agnostic: resolves the
 * source relative to this script, never a hard-coded home.
 *
 *   node scripts/install-theme.mjs
 */
import { mkdir, copyFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const source = resolve(scriptDir, "..", ".opencode", "themes", "verdict.json")

const configHome =
  process.env.XDG_CONFIG_HOME && process.env.XDG_CONFIG_HOME.trim().length > 0
    ? process.env.XDG_CONFIG_HOME
    : join(homedir(), ".config")

const targetDir = join(configHome, "opencode", "themes")
const target = join(targetDir, "verdict.json")

await mkdir(targetDir, { recursive: true })
await copyFile(source, target)
console.error(`Installed VERDICT theme -> ${target}`)
console.error('Select it in the TUI with `/theme verdict`, or it is applied automatically by the harness.')
