# Heartbeat checklist

## 1. Check for open tasks (primary)

Run `ls workspace/openTasks/` (via `exec`) to list pending task files.

- If the folder is **empty or missing** (only `.keep` present or no files): nothing to do → reply `HEARTBEAT_OK`
- If files exist: for each task file:
  1. Read the file to understand what was promised, to whom, and on which session
  2. Call `sessions_list` (kinds: `["group", "main"]`, activeMinutes: 240, messageLimit: 5) to verify the session is still live and get fresh `deliveryContext`
  3. Assess: can you now deliver on the promise? (task done, update available, or deadline reached)
     - **Yes** → use the `message` tool with the session's `deliveryContext` to send the follow-up, then **delete the task file**
     - **Not yet** → leave the file, do nothing
     - **Session gone / stale** → delete the task file (no longer deliverable)

## 2. Nothing pending

If all task files were handled or skipped: reply `HEARTBEAT_OK`

---

## Task file format

When writing a task file, use this structure and name it `openTasks/<YYYY-MM-DD>-<short-slug>.md`:

```
# Open Task

**Promised:** <what you said you'd do or report back on>
**To:** <person/group name>
**Session key:** <session key from sessions_list, e.g. agent::main::group:C09RWHR8Q14>
**Channel:** <slack / whatsapp / etc.>
**Delivery context:** <paste the deliveryContext JSON from sessions_list>
**Created:** <ISO timestamp>
**Deadline:** <optional — e.g. "within 1 hour" or "end of day">
```
