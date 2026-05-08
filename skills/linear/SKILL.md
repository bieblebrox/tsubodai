---
name: linear
description: Linear via MCPorter calling Linear's official hosted MCP — full issue/project workflow (teams, projects, milestones, cycles, labels, attachments).
homepage: https://linear.app
metadata: {"openclaw":{"requires":{"env":["LINEAR_API_KEY"]}}}
---

# Linear (MCPorter + hosted MCP)

Use **[MCPorter](https://github.com/steipete/mcporter)** to call **[Linear's MCP](https://linear.app/docs/mcp)** (`https://mcp.linear.app/mcp`). This replaces the old bash/GraphQL helper: you get the same tool surface as Cursor's Linear connector (richer create/update than `teamId` + title only).

## Requirements

- `LINEAR_API_KEY` in the OpenClaw runtime (already set globally in `openclaw.json` for this host).
- `MCPORTER_CONFIG` points at this skill's `mcporter.json` (set via `skills.entries.linear.env` in `openclaw.json`).
- Node/npm available for `npx`.

## Quick wrapper (from workspace root)

```bash
{baseDir}/scripts/linear-mcp.sh list linear
{baseDir}/scripts/linear-mcp.sh list linear --all-parameters
{baseDir}/scripts/linear-mcp.sh call linear.list_issues teamId=... --output json
```

Or equivalently:

```bash
npx -y mcporter@latest --config {baseDir}/mcporter.json list linear
npx -y mcporter@latest --config {baseDir}/mcporter.json call 'linear.create_issue(title: "...", team: "PAR", project: "...")'
```

## Discovery (read this before creating issues)

1. **List tools and signatures:**  
   `{baseDir}/scripts/linear-mcp.sh list linear`  
   Use `--all-parameters` or `--schema` when you need every field (project, cycle, milestone, labels, state, etc.).

2. **Resolve IDs:** Prefer MCP tools that list teams, projects, cycles, or issues over guessing. Wrong `team` / `project` / `cycle` IDs were the main failure mode with the old skill.

## Creating and updating work

- Use **`mcporter call`** with the exact tool names from `list` (snake_case in API; MCPorter accepts dotted names like `linear.create_issue`).
- Pass **explicit** `team`, `project`, `cycle`, `milestone`, `label` / `labelIds`, `state`, `priority`, and **assignee** when the user cares about placement — do not create bare issues and assume defaults.
- For machine-readable output in scripts: `--output json` (see [MCPorter CLI docs](https://github.com/steipete/mcporter)).

## Attachments

The hosted MCP exposes attachment tools (e.g. base64 upload). Use `list linear --all-parameters` for the current schema.

## Auth note

`mcporter.json` uses `"Authorization": "Bearer ${LINEAR_API_KEY}"` (MCPorter env interpolation). If you see 401, confirm the key is present in the agent environment.

## Git ↔ Linear

Branch names and PR automation still follow Linear's GitHub integration. After creating an issue, use whichever MCP tool exposes branch name (or the issue URL) and follow `AGENTS.md` / team conventions for branch naming.
