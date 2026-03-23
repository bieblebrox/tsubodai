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

Fetch a node's current Slate content blocks and a stable content hash. The hash must be passed to `node:update --mode replace` to confirm you have seen the content before overwriting it.

```sh
node parmind-cli.mjs node:contents --id <nodeId>
```

**Output:** `{ nodeId, nodeName, contents: SlateNode[], contentHash: string }`

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

## Error handling

All commands exit with code `1` on failure and write an error message to stderr. Transient errors (HTTP 429, 503) are retried up to 3 times with exponential backoff before failing.
