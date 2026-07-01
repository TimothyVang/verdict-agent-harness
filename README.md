# verdict-agent-harness

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

## API

| Method | Purpose |
| --- | --- |
| `start()` / `stop()` | Spawn/attach and tear down the server connection |
| `createSession(title?)` / `deleteSession(id)` | Session lifecycle |
| `ask(sessionID, text, opts?)` | One prompt turn → assistant text |
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
src/            # harness source (types, harness, index)
examples/       # runnable usage examples
vendor/
  opencode-sdk/ # vendored @opencode-ai/sdk 1.17.13 (MIT)
```

## Licensing

- Harness code (`src/`, `examples/`): **Apache-2.0** — see [LICENSE](LICENSE).
- Vendored SDK (`vendor/opencode-sdk`): **MIT**, © the opencode authors — see the
  attribution in [NOTICE](NOTICE).
