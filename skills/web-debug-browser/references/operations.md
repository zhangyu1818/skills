# Chrome DevTools MCP Operations

## Quick Start (Local Chrome)
1. Start Chrome with remote debugging on port 9222 and a dedicated user data dir.
   - macOS: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable`
   - Linux: `/usr/bin/google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable`
   - Windows: `"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-profile-stable"`
2. Start the MCP server and connect to the running browser:
   - `npx -y chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222`
3. Verify the session:
   - `list_pages`
   - `new_page` to open a URL

## Core Tools (By Intent)

### Navigation
- `new_page`, `navigate_page`, `wait_for`
- `list_pages`, `select_page`, `close_page`

### Snapshot and Targeting
- `take_snapshot` returns element `uid` values for reliable targeting.
- Use `uid` with `click`, `fill`, `hover`, `drag`, `upload_file`.
- Refresh `uid`s after DOM changes; use `includeSnapshot: true` for inline refresh.

### Interaction
- `click`, `fill`, `press_key`, `hover`, `drag`, `upload_file`, `handle_dialog`

### State and Validation
- Use `evaluate_script` for title, URL, text, value, and computed state.

Example:
```
evaluate_script function="() => ({ title: document.title, url: location.href })"
```

### DevTools: Console and Network
- `list_console_messages`, `get_console_message`
- `list_network_requests`, `get_network_request`

### Visual Evidence
- `take_screenshot` (set `fullPage: true` when needed)
- `take_snapshot` for text-based state capture

### Performance
- `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`

## Output and Files
- Use `filePath` on `take_snapshot`, `take_screenshot`, `performance_*`, and `get_network_request` when you need artifacts saved to disk.

## Example Workflows

### Login Flow With Snapshot UIDs
```
new_page url=http://127.0.0.1:3000/login
take_snapshot
fill uid=<email_uid> value="user@example.com"
fill uid=<password_uid> value="password"
click uid=<submit_uid>
wait_for text="Dashboard"
list_console_messages
```

### Debug a UI Error
```
new_page url=http://127.0.0.1:3000
take_snapshot
click uid=<button_uid>
list_console_messages
list_network_requests
take_screenshot fullPage=true filePath=debug.png
performance_start_trace autoStop=false reload=false filePath=debug.trace.json
click uid=<submit_uid>
performance_stop_trace filePath=debug.trace.json
```

### Data Extraction With Script Evaluation
```
new_page url=http://127.0.0.1:3000/data
evaluate_script function="() => document.querySelector('h1')?.textContent"
evaluate_script function="() => document.querySelector('[data-id]')?.getAttribute('data-id')"
```

## References
- Tool reference: `@skills/web-debug-browse/references/tool-reference.md`
- Troubleshooting: `@skills/web-debug-browse/references/troubleshooting.md`
