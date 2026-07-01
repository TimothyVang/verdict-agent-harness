<p align="center">
  <img src="assets/logo/logo.png" alt="VERDICT" width="560">
</p>

<p align="center"><b>VERDICT Agent Harness</b></p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-4D5DFF.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/MCP-compatible-4D5DFF.svg" alt="MCP compatible">
  <img src="https://img.shields.io/badge/opencode%20SDK-vendored%201.17.13-B8A8FF.svg" alt="Vendored opencode SDK">
  <img src="https://img.shields.io/badge/harness-read--only%20forensic-73D9C2.svg" alt="Read-only forensic">
  <img src="https://img.shields.io/badge/TypeScript-5.6-4D5DFF.svg" alt="TypeScript 5.6">
  <img src="https://img.shields.io/badge/node-20-73D9C2.svg" alt="Node 20">
</p>

<p align="center"><b>Show Me the Evidence — drive an opencode agent through VERDICT's typed, read-only forensic MCP tools, custody intact.</b></p>

<p align="center">
  <a href="https://github.com/TimothyVang/verdict-dfir"><b>VERDICT</b></a> ·
  <a href="#usage"><b>Usage</b></a> ·
  <a href="#api"><b>API</b></a> ·
  <a href="#vendored-sdk"><b>Vendored SDK</b></a> ·
  <a href="https://opencode.ai/docs/sdk/"><b>opencode SDK</b></a>
</p>

---

> **Trace it. Test it. Trust it.** Evidence over assumption — the harness wires
> an agent to the tools, it does not upgrade what those tools conclude.

A small TypeScript harness that drives an [opencode](https://opencode.ai) agent
session with the **VERDICT** forensic MCP server attached — so an AI agent can
run read-only DFIR investigations through opencode's tool loop.

It is built on a **vendored copy of the opencode SDK** (`@opencode-ai/sdk`),
committed under [`vendor/opencode-sdk`](vendor/opencode-sdk) so the SDK internals
can be inspected and modified in-tree rather than pinned as an opaque dependency.

> **Scope, up front:** this repository is the *harness* — a typed wrapper around
> the opencode client/server plus VERDICT MCP wiring. It does **not** bundle the
> opencode runtime, a model provider, or the VERDICT MCP binary. You supply those
> (see [Prerequisites](#prerequisites)). The harness code typechecks and imports
> cleanly; running a full session additionally requires those external pieces.

## What it does

- Spawns an opencode server (via the vendored SDK) with the VERDICT MCP server
  injected into its config — or attaches to a server you already run.
- Opens sessions and sends prompt turns, returning the assistant's text.
- Lists exposed tools, MCP status, providers, and agents.
- Streams live server events (tool calls, message deltas) for observability.

## Vendored SDK

`vendor/opencode-sdk` is the published `@opencode-ai/sdk` **1.17.13** package
(MIT). It is wired in through a `file:` dependency, so `npm install` symlinks it
into `node_modules/@opencode-ai/sdk`. What ships in the npm package is the
compiled, **unminified** ESM `dist/` plus `.d.ts` types — readable and editable,
but generated (the OpenAPI client under `dist/gen`), not the original hand-written
sources from the opencode monorepo. To bump it, replace the folder contents with a
newer package tarball and re-run the typecheck.

## Prerequisites

- **Node.js ≥ 20**
- **opencode** installed and runnable (the SDK server launcher shells out to it)
- **A configured model provider** (e.g. `anthropic`) with credentials opencode
  can read
- **The VERDICT MCP server** — the `verdict` binary from
  [`verdict-dfir`](https://github.com/TimothyVang/verdict-dfir), on `PATH`

## Install

```bash
npm install
npm run build
```

## Usage

```ts
import { VerdictHarness } from "verdict-agent-harness"

const harness = new VerdictHarness({
  directory: "/cases/2026-07-01-incident",
  model: { providerID: "anthropic", modelID: "claude-sonnet-5" },
  verdictMcp: { type: "local", command: ["verdict", "mcp"] },
})

await harness.start()

const session = await harness.createSession("Timeline review")
const answer = await harness.ask(
  session.id,
  "Build a timeline from the acquired artifacts and flag anything anomalous.",
)
console.log(answer)

await harness.stop()
```

### Attach to an existing server

```ts
const harness = new VerdictHarness({ baseUrl: "http://localhost:4096" })
await harness.start()
await harness.onEvents((event) => console.log(event))
```

## Branded TUI

The harness carries the VERDICT brand into the opencode terminal UI via a theme
built from the brand palette — Midnight Ink background, Paper Cream text,
Electric Cobalt primary, Soft Lilac secondary, and the semantic
Seafoam / Signal Coral / Butter Yellow states. It ships as an opencode theme at
[`.opencode/themes/verdict.json`](.opencode/themes/verdict.json) (dark + light
variants).

Install it user-wide so the TUI finds it from any case directory, then launch:

```bash
npm run install-theme        # copies the theme into ~/.config/opencode/themes/
node --experimental-strip-types examples/launch-tui.ts
```

Or from code — the harness applies `theme: "verdict"` by default to both the
spawned server and the TUI:

```ts
const harness = new VerdictHarness({ directory: "/cases/incident" })
const tui = harness.launchTui()   // VERDICT-themed opencode TUI
// tui.close() to stop it
```

Pass `theme: null` in the harness options to inherit opencode's default theme,
or `theme: "some-other-theme"` to use a different one. Inside the TUI you can
also switch with `/theme verdict`.

## API

| Method | Purpose |
| --- | --- |
| `start()` / `stop()` | Spawn/attach and tear down the server connection |
| `createSession(title?)` / `deleteSession(id)` | Session lifecycle |
| `ask(sessionID, text, opts?)` | One prompt turn → assistant text |
| `launchTui(opts?)` | Launch the VERDICT-themed opencode TUI |
| `onEvents(handler, signal?)` | Stream server-sent events |
| `listTools()` / `mcpStatus()` / `providers()` / `agents()` | Introspection |
| `raw` | The underlying `OpencodeClient` for unwrapped calls |

## Examples

```bash
# spawn a server + run one forensic prompt
node --experimental-strip-types examples/run-session.ts

# attach to a running server and tail its event stream
OPENCODE_BASE_URL=http://localhost:4096 \
  node --experimental-strip-types examples/stream-events.ts
```

## Layout

```
src/                        # harness source (types, harness, index)
examples/                   # runnable usage examples
scripts/install-theme.mjs   # install the VERDICT theme user-wide
.opencode/themes/verdict.json  # VERDICT brand theme for the opencode TUI
vendor/
  opencode-sdk/             # vendored @opencode-ai/sdk 1.17.13 (MIT)
```

## Licensing

- Harness code (`src/`, `examples/`): **Apache-2.0** — see [LICENSE](LICENSE).
- Vendored SDK (`vendor/opencode-sdk`): **MIT**, © the opencode authors — see the
  attribution in [NOTICE](NOTICE).
