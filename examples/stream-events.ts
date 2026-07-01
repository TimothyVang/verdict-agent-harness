/**
 * Attach to an already-running opencode server and print its live event stream —
 * useful for watching tool calls as an agent drives a VERDICT investigation.
 *
 *   OPENCODE_BASE_URL=http://localhost:4096 node dist/examples/stream-events.js
 */
import { VerdictHarness } from "../src/index.js"

const harness = new VerdictHarness({
  baseUrl: process.env.OPENCODE_BASE_URL ?? "http://localhost:4096",
})

async function main() {
  await harness.start()
  console.error(`streaming events from ${harness.url} — ctrl-c to stop`)
  await harness.onEvents((event) => {
    console.log(JSON.stringify(event))
  })
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
