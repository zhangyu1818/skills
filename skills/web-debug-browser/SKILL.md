---
name: web-debug-browser
description: Operate and debug web pages using Chrome DevTools MCP (chrome-devtools-mcp). Use for browser automation, UI debugging, DevTools console/error inspection, screenshots/traces, and connecting to a local Chrome instance over CDP on port 9222 to reproduce and diagnose frontend issues.
---

# Web Debug Browser

## Overview
Use Chrome DevTools MCP (`chrome-devtools-mcp`) to drive Chrome/Chromium for debugging and inspection tasks, with a default workflow that connects to a locally running Chrome instance via CDP on port 9222.

## Default Connection (Local Chrome)
1. Assumes Chrome is already running with remote debugging enabled on port 9222.
2. If connection fails, ask the user to start Chrome with `--remote-debugging-port=9222` and a dedicated `--user-data-dir`.
3. Verify the session with `list_pages` or by opening a page with `new_page`.

## Debugging Workflow
1. Open page: `new_page` or `navigate_page`.
2. Capture refs: `take_snapshot` and use element `uid` values for actions.
3. Interact: `click`, `fill`, `press_key`, `hover`, `drag`, `upload_file`, `handle_dialog`.
4. Wait/verify: `wait_for`, `take_snapshot`, `evaluate_script` (e.g., `document.title`, `location.href`).
5. Inspect DevTools output: `list_console_messages` / `get_console_message`, `list_network_requests` / `get_network_request`.
6. Collect evidence: `take_screenshot` (use `fullPage` when needed), `performance_start_trace` / `performance_stop_trace`, `performance_analyze_insight`.
7. Manage pages: `list_pages`, `select_page`, `close_page`.

## Selection Strategy
- Prefer snapshot `uid`s from `take_snapshot` over brittle selectors.
- Keep `uid`s fresh: re-run `take_snapshot` after DOM changes or use `includeSnapshot: true` on input tools.
- Use `take_screenshot` when visual confirmation is required.

## Output and Sessions
- Use `filePath` on `take_snapshot`, `take_screenshot`, `performance_*`, and `get_network_request` when you need files saved.
- Use `list_pages` + `select_page` to scope subsequent tool calls to the correct tab.

## References
- Primary workflow: `@skills/web-debug-browse/references/operations.md`
- Tool reference: `@skills/web-debug-browse/references/tool-reference.md`
- Troubleshooting: `@skills/web-debug-browse/references/troubleshooting.md`
