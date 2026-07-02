/**
 * Launch the opencode TUI branded with the VERDICT theme, pointed at a case
 * directory with the VERDICT MCP server available.
 *
 * Install the theme user-wide first so the TUI finds it from any directory:
 *   node scripts/install-theme.mjs
 *
 * Then:
 *   node --experimental-strip-types examples/launch-tui.ts
 */
import { VerdictHarness } from "../src/index.js"

const harness = new VerdictHarness({
  directory: process.env.VERDICT_CASE_DIR ?? process.cwd(),
  // theme defaults to "verdict"; pass `theme: null` to inherit opencode's default
  verdictMcp: {
    type: "local",
    command: (process.env.VERDICT_MCP_CMD ?? "verdict mcp").split(" "),
  },
})

const tui = harness.launchTui({ banner: "both" })
console.error("VERDICT-branded TUI launched — close the TUI window to exit")

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    tui.close()
    process.exit(0)
  })
}
