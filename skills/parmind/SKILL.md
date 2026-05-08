# Parmind Skill

Gives you access to a Parmind knowledge base: create notes, manage areas, search content, and inspect node context — all through a single CLI binary.

## Setup

Download the CLI binary from the release and set the required environment variables:

```sh
export PARMIND_API_KEY="<your-api-key>"
export PARMIND_KB_ID="<your-knowledge-base-id>"

# Optional: override the default API endpoint
export PARMIND_API_BASE="https://f1.gloow.io"
```

Run the binary with Node 22+:

```sh
node parmind-cli.mjs <command> [options]
```

All commands write JSON to stdout. Use `--pretty` on any command for formatted output.

---

## Commands

### note:create

Create a note in the knowledge base.

```sh
node parmind-cli.mjs note:create \
  --title "My Note" \
  --markdown "# Hello\nThis is the note body." \
  [--kb <kbId>] \
  [--area <areaId> ...] \
  [--markdown-file <path>]
```

| Option | Description |
|---|---|
| `--title` | **(required)** Note title |
| `--markdown` | Markdown string for the note body |
| `--markdown-file` | Path to a `.md` file to use as the body |
| `--kb` | Knowledge base ID (overrides `PARMIND_KB_ID`) |
| `--area` | One or more area IDs to tag the note with |

**Output:** `{ nodeId: string, node: Node }`

---

### note:get

Fetch a single note by its node ID.

```sh
node parmind-cli.mjs note:get --id <nodeId>
```

**Output:** `{ node: Node }`

---

### node:list

Browse nodes in the knowledge base with optional filtering and sorting. Returns a trimmed summary per node (no Slate content blob) — useful for discovery before fetching full content.

```sh
node parmind-cli.mjs node:list \
  [--sort-by createdAt|updatedAt|name] \
  [--sort-order asc|desc] \
  [--area <areaId>] \
  [--related-to <nodeId>] \
  [--type Note|Resource|Entity] \
  [--skip 0] \
  [--take 20]
```

| Option | Description |
|---|---|
| `--sort-by` | Sort field: `createdAt`, `updatedAt` (default), or `name` |
| `--sort-order` | `asc` or `desc` (default) |
| `--area` | Filter to nodes belonging to this area ID |
| `--related-to` | Filter to nodes connected (any direction) to this node ID |
| `--type` | Filter by node type — e.g. `Note`, `Resource`, `Entity` |
| `--skip` | Pagination offset (default `0`) |
| `--take` | Page size (default `20`, max `100`) |

**Output:** `{ nodes: Node[], skip: number, take: number }`

Each node includes its area mappings and resource metadata inline.

---

### search

Full-text search across the knowledge base.

```sh
node parmind-cli.mjs search \
  --query "machine learning" \
  [--page 1] \
  [--page-size 15]
```

**Output:** `{ query, page, pageSize, total, results: SearchResult[] }`

---

### area:list

List all areas in the knowledge base.

```sh
node parmind-cli.mjs area:list
```

**Output:** `{ areas: Area[] }`

---

### area:create

Create a new area (collection/tag) in the knowledge base.

```sh
node parmind-cli.mjs area:create \
  --name "Go-To-Market" \
  [--kb <kbId>] \
  [--description "GTM planning area"] \
  [--color "#FF5A5F"] \
  [--icon "flag"] \
  [--data '{"owner":"ops"}'] \
  [--data-file <path>]
```

**Output:** `{ area: Area }`

---

### area:apply

Apply an existing area to an existing node.

```sh
node parmind-cli.mjs area:apply \
  --area <areaId> \
  --node <nodeId>
```

**Output:** `{ success: true }`

---

### node:context

Get a node's full context: its own data plus all directly connected nodes and relations.

```sh
node parmind-cli.mjs node:context --id <nodeId>
```

**Output:** `{ node: Node, relatedNodes: Node[], relations: Relation[] }`

---

### node:contents

Fetch a node's current Slate content blocks and its server-computed content hash. The hash must be passed to `node:update --mode replace` to confirm you have seen the content before overwriting it. The hash is computed and owned by the server — you never need to calculate it yourself.

```sh
node parmind-cli.mjs node:contents --id <nodeId>
```

**Output:** `{ nodeId, nodeName, contents: SlateNode[], contentHash: string }`

---

### relation:create

Create a relation (graph edge) between two existing nodes. Use this to explicitly link any two notes by their node IDs.

```sh
node parmind-cli.mjs relation:create \
  --source <sourceNodeId> \
  --target <targetNodeId> \
  [--name "relates to"]
```

| Option | Description |
|---|---|
| `--source` | **(required)** Source node ID |
| `--target` | **(required)** Target node ID |
| `--name` | Optional label for the relation |

**Output:** `{ relation: Relation }`

---

### node:update

Update a node's content from a Markdown string or file.

```sh
node parmind-cli.mjs node:update \
  --id <nodeId> \
  --markdown "## New section\n- bullet" \
  [--mode append|replace] \
  [--content-hash <hash>] \
  [--markdown-file <path>]
```

| Option | Description |
|---|---|
| `--id` | **(required)** Node ID |
| `--markdown` | Markdown content string |
| `--markdown-file` | Path to a `.md` file |
| `--mode` | `append` (default) or `replace` |
| `--content-hash` | Hash from `node:contents` — required when `--mode replace` and node has content |

**Output:** `{ nodeId, nodeName, mode }`

> **replace flow:** First run `node:contents --id <id>`, copy the `contentHash`, then pass it via `--content-hash`. The write is rejected if the node was modified since you read it.

---

## Global options

These can be passed to any command instead of using environment variables:

| Option | Env var | Description |
|---|---|---|
| `--api-key <key>` | `PARMIND_API_KEY` | Parmind API key |
| `--api-base <url>` | `PARMIND_API_BASE` | Override API base URL |
| `--kb <kbId>` | `PARMIND_KB_ID` | Default knowledge base ID |
| `--pretty` | — | Pretty-print JSON output |

---

## Linking Notes (Creating Relations)

Notes in the knowledge base can be connected to each other with **relations** — directed graph edges that model how ideas relate. There are two ways to create relations.

### Method 1 — Wikilinks in note content (recommended)

Use `[[Note Title]]` syntax anywhere in the markdown body of `note:create` or `node:update`. The backend automatically:

1. Looks up each `[[...]]` title by exact name (case-insensitive) in the same knowledge base
2. Replaces the wikilink with a proper inline mention node in the stored content (so the UI renders it as a clickable reference to that note)
3. Creates a `Relation` graph edge between the new note and each resolved target

```sh
node parmind-cli.mjs note:create \
  --title "Sprint Planning 2026-W14" \
  --markdown "Building on [[Plan: 2026-W13]]. See also [[Goals 2026]]."
```

- If `Plan: 2026-W13` exists in the KB → it becomes a mention node and a relation is created automatically.
- If `Goals 2026` does not exist → it is left as plain text `[[Goals 2026]]` in the content (no relation created). Create that note first, then use `relation:create` to link them manually.

> **Important:** Matching requires an **exact name** (case-insensitive). If the target note does not yet exist, create it first, then link with `relation:create`.

### Method 2 — Explicit `relation:create`

When you already have the node IDs of both notes, link them directly:

```sh
# 1. Find the target note ID
node parmind-cli.mjs search --query "Plan: 2026-W13" --pretty

# 2. Create the relation
node parmind-cli.mjs relation:create \
  --source <sourceNodeId> \
  --target <targetNodeId> \
  --name "follows up on"
```

Use `node:context --id <nodeId>` at any time to inspect all existing relations for a node.

---

## Writing note content

Keep these in mind when composing markdown for `note:create` or `node:update`:

- **Do not open with an H1 header.** The node's `name` (title) is already rendered as a prominent heading in the UI. Starting the content with `# Note Title` creates a redundant duplicate. Use `##` or lower for any sections you need.
- **Use plain markdown.** The content is rendered in a rich-text editor; standard markdown (bold, italic, lists, code blocks, links, wikilinks) all work. Avoid raw HTML.

---

## Error handling

All commands exit with code `1` on failure and write an error message to stderr. Transient errors (HTTP 429, 503) are retried up to 3 times with exponential backoff before failing.
