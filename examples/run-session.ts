/**
 * Spawn an opencode server with the VERDICT MCP server attached, open a session,
 * and drive one forensic prompt. Requires the `verdict` MCP binary on PATH and a
 * configured model provider (see README).
 *
 *   node --experimental-strip-types examples/run-session.ts
 *   # or after `npm run build`:
 *   node dist/examples/run-session.js
 */
import { VerdictHarness } from "../src/index.js"

const model = process.env.VERDICT_MODEL_ID
  ? {
      providerID: process.env.VERDICT_PROVIDER_ID ?? "anthropic",
      modelID: process.env.VERDICT_MODEL_ID,
    }
  : undefined

const harness = new VerdictHarness({
  directory: process.env.VERDICT_CASE_DIR ?? process.cwd(),
  model,
  verdictMcp: {
    type: "local",
    command: (process.env.VERDICT_MCP_CMD ?? "verdict mcp").split(" "),
  },
})

async function main() {
  await harness.start()
  console.error(`opencode server: ${harness.url}`)

  const tools = await harness.listTools()
  console.error(`tools exposed: ${tools.length}`)

  const session = await harness.createSession("VERDICT investigation")
  const answer = await harness.ask(
    session.id,
    "List the VERDICT forensic tools available and summarize what each does.",
    { tools: { "verdict_*": true } },
  )
  console.log(answer)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => harness.stop())
