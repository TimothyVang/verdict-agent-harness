# CLAUDE.md — verdict-agent-harness

TypeScript agent harness that drives an opencode session with the VERDICT
forensic MCP server attached. Built on a **vendored** copy of `@opencode-ai/sdk`.

## Layout
- `src/` — harness source. `types.ts` (public types), `harness.ts` (`VerdictHarness`, `launchTui`), `index.ts` (exports).
- `examples/` — runnable usage examples (`run-session`, `stream-events`, `launch-tui`).
- `.opencode/themes/verdict.json` — VERDICT brand theme for the opencode TUI (dark + light). Palette from `dev-verdict-github/docs/brand.md`; keep semantic colors (Seafoam=pass, Coral=fail, Butter=review) meaningful, not decorative.
- `scripts/install-theme.mjs` — copies the theme into `$XDG_CONFIG_HOME/opencode/themes/` so the TUI finds it from any case dir.
- `vendor/opencode-sdk/` — vendored `@opencode-ai/sdk` 1.17.13 (MIT). Wired via a `file:` dependency; **do not** replace with an npm-registry version — edits here are intentional.

## Branding
- Visual source of truth is VERDICT's v2 brand (`dev-verdict-github/docs/brand.md` + `VERDICT_DFIR_SVG_Assets_v2/`). README header + badges and the TUI theme both derive from that palette. Update the theme `defs` if the palette changes; do not invent new brand colors.

## Conventions
- ESM only (`"type": "module"`), NodeNext resolution — imports use `.js` extensions.
- Strict TS. Wrap SDK `{ data, error }` results through `unwrap()`; never read `.data` blindly.
- Immutable style, small files, no secrets in source (model creds come from the environment/opencode config).
- Harness code is Apache-2.0; the vendored SDK stays MIT (see `NOTICE`).

## Commands
- `npm install` — links the vendored SDK into `node_modules`.
- `npm run typecheck` / `npm run build`.
- `npm run example:session` / `npm run example:events` — need opencode, a model provider, and the `verdict` MCP binary present.
