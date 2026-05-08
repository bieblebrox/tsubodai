# Heartbeat checklist

## 1. Daily memory recovery

- Read `memory/YYYY-MM-DD.md` for today and yesterday.
- If yesterday's daily file is missing, sparse, or has no evening entries, recover unrecorded session work:
  - Use `sessions_list` (kinds: `["group", "main"]`, activeMinutes: 2880) to find Tsubodai sessions from the last 48h.
  - For any session updated yesterday that isn't already captured in the daily file, use `sessions_history` (with `sessionKey` and `limit: 50`) to read what was discussed.
  - Also check `~/.openclaw/agents/main/sessions/` for any `*.reset.*` files modified in the last 2 days — read them directly with the `read` tool to recover archived transcript content.
  - Distill any work not already captured into a bullet in yesterday's memory file (decisions, IDs, script names, file paths, conclusions — same format as existing entries).
- If today's file doesn't exist yet, create it with a header: `# YYYY-MM-DD`

## 2. Check for open tasks

Run `ls workspace/openTasks/` (via `exec`) to list pending task files.

- If the folder is **empty or missing** (only `.keep` present or no files): nothing to do → reply `HEARTBEAT_OK`
- If files exist: for each task file:
  1. Read the file to understand what was promised, to whom, and on which session
  2. Call `sessions_list` (kinds: `["group", "main"]`, activeMinutes: 240, messageLimit: 5) to verify the session is still live and get fresh `deliveryContext`
  3. Assess: can you now deliver on the promise? (task done, update available, or deadline reached)
     - **Yes** → use the `message` tool with the session's `deliveryContext` to send the follow-up, then **delete the task file**
     - **Not yet** → leave the file, do nothing
     - **Session gone / stale** → delete the task file (no longer deliverable)

## 3. Memory distillation (weekly)

Once per week (or when daily files accumulate 5+ unreviewed days):

1. Read through recent `memory/YYYY-MM-DD.md` files not yet distilled
2. Identify significant decisions, lessons, project context, or facts worth keeping long-term
3. Append distilled entries to `MEMORY.md`
4. Remove anything in MEMORY.md that's outdated or no longer relevant

## 4. Nothing pending

If all checks passed and task files were handled or skipped: reply `HEARTBEAT_OK`

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
