---
name: parmind
description: "Read and write Parmind knowledge base content. Use to create notes, search the KB, list areas, apply areas to nodes, and retrieve node context with relations."
---

# Parmind Skill

Use this skill whenever you need to interact with Josh's Parmind knowledge base — creating notes, searching for existing content, browsing the area taxonomy, or enriching a node with context.

The CLI is a self-contained bundle (`parmind-cli.mjs`). All requests are authenticated via the `PARMIND_API_KEY` environment variable (KB-scoped API key). No user JWT is needed.

## Environment Variables

Set these in the skill's `env` block in `openclaw.json`. The CLI refuses to run without `PARMIND_API_KEY`.

| Variable | Required | Notes |
|---|---|---|
| `PARMIND_API_KEY` | Yes | KB-scoped API key (`pk_live_...`) |
| `PARMIND_API_BASE` | No | Override API base URL (defaults to `https://f1.gloow.io`) |
| `PARMIND_KB_ID` | Recommended | Josh's default KB ID — avoids passing `--kb` to every `note:create` call |

## Script Reference

Executable: `skills/parmind/scripts/parmind-cli.mjs`

All commands output JSON to stdout. Use `--pretty` for human-readable output. Errors print to stderr and exit with code 1.

---

### `note:create`

Create a note in the KB. Content can be provided as inline markdown or a file path. The note is automatically converted to Slate format before saving.

```bash
node skills/parmind/scripts/parmind-cli.mjs note:create \
  --title "Meeting notes 2026-03-09" \
  --markdown "## Summary\n\nDiscussed Q2 roadmap and onboarding priorities."
```

```bash
node skills/parmind/scripts/parmind-cli.mjs note:create \
  --title "Research: vector DB options" \
  --markdown-file /tmp/research.md \
  --area <areaId>
```

Options:
- `--title <title>` (required)
- `--kb <kbId>` — overrides `PARMIND_KB_ID` env for this call
- `--markdown <text>` — inline markdown string
- `--markdown-file <file>` — path to a `.md` file
- `--area <id> [<id>...]` — one or more area IDs to apply immediately

---

### `note:get`

Fetch a single note by node ID.

```bash
node skills/parmind/scripts/parmind-cli.mjs note:get --id <nodeId>
```

---

### `search`

Full-text search across the KB. Useful for finding existing notes before creating duplicates or gathering context.

```bash
node skills/parmind/scripts/parmind-cli.mjs search --query "vector database"
node skills/parmind/scripts/parmind-cli.mjs search --query "onboarding" --page-size 5
```

Options:
- `--query <text>` (required)
- `--page <n>` (default: 1)
- `--page-size <n>` (default: 15)

---

### `area:list`

List all areas defined in the KB. Use this to discover valid area IDs before applying them.

```bash
node skills/parmind/scripts/parmind-cli.mjs area:list --pretty
```

---

### `area:create`

Create a new area inside the KB (API-key flow already carries owner-level permissions). Accepts optional color/icon/data payloads and reads JSON either inline or from a file.

```bash
node skills/parmind/scripts/parmind-cli.mjs area:create \
  --kb <kbId> \
  --name "Go-To-Market" \
  --color "#ff5a5f" \
  --icon "Target" \
  --data '{"owner":"ops","priority":"P1"}'
```

Options:
- `--kb <kbId>` — overrides `PARMIND_KB_ID`
- `--name <name>` (required)
- `--description <text>` — optional summary, max 255 chars
- `--color <value>` / `--icon <name>` — match Merlin expectations
- `--data <json>` or `--data-file <path>` — structured metadata blob

---

### `area:apply`

Apply an area tag to an existing node.

```bash
node skills/parmind/scripts/parmind-cli.mjs area:apply --area <areaId> --node <nodeId>
```

---

### `node:context`

Retrieve a node together with its connected nodes and relations. Useful for understanding how a piece of knowledge is linked.

```bash
node skills/parmind/scripts/parmind-cli.mjs node:context --id <nodeId>
```

---

## Response Format

All commands print JSON to stdout.

**Success (note:create, note:get, node:context):**
```json
{
  "nodeId": "abc123",
  "node": { "id": "abc123", "name": "...", "contents": [...], ... }
}
```

**Success (search):**
```json
{
  "query": "onboarding",
  "page": 1,
  "pageSize": 15,
  "total": 42,
  "results": [ { "nodeId": "...", "title": "...", "excerpt": "..." } ]
}
```

**Success (area:list):**
```json
{
  "areas": [ { "id": "...", "name": "...", "color": "..." } ]
}
```

**Error:**
```
Error message printed to stderr, exit code 1
```

---

## Workflow Tips

- **Before creating a note**, run `search` to check if a related note already exists. Prefer enriching an existing note via `node:context` + a follow-up `note:create` with refined content.
- **For area assignment**, run `area:list` at session start to build a mapping of area names → IDs. Cache these in-session to avoid repeated calls.
- **Large markdown content** should be written to a temp file and passed via `--markdown-file` rather than inlined in the shell command to avoid quoting issues.
- **`PARMIND_KB_ID` should always be set** in the skill env so that `note:create` never requires an explicit `--kb` flag. If it is missing, the CLI will print a clear error.
- When the API returns an error (non-200), the error message from the server is surfaced verbatim — relay it to Josh if it indicates a configuration or permission issue.

## Installing the CLI

The `parmind-cli.mjs` file is a bundled build artifact from `libs/parmind-skill` in the Sirius monorepo. To (re)build and copy it here:

```bash
# From the Sirius monorepo root
nx run parmind-skill:bundle-cli

# Copy output to this skill folder
cp dist/libs/parmind-skill-cli/parmind-cli.mjs \
  ~/.openclaw/workspace/skills/parmind/scripts/parmind-cli.mjs

chmod +x ~/.openclaw/workspace/skills/parmind/scripts/parmind-cli.mjs
```
