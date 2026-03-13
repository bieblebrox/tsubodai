# Parmind Skill Library — Implementation Plan (v2025-03-02)

## Scope & Location
- **Project location:** `libs/parmind-skill` inside the Sirius Nx workspace.
- **Distribution:** Internal-only for now (no npm publish). Consume directly via Nx/lib imports or the local CLI entry point.

## 1. Project Skeleton
- Generate a new Nx TypeScript library (`nx g @nx/js:lib parmind-skill --bundler=tsc`).
- Output targets:
  - `build` → emits ESM/CJS bundles for internal imports.
  - Optional `cli` entry (Node script) under `libs/parmind-skill/bin/parmind-skill.ts`.
- Dependencies: `@sirius/apiconsumer`, `zod` (validation), `commander` (CLI), `cross-fetch` if needed.

## 2. Config & Auth Layer
- `createClient(config)` helper that accepts:
  - **User credentials:** `{ jwt, kbToken }` (mirrors current Merlin auth headers).
  - **API key credentials (future):** `{ apiKey }` (KB-scoped key per `parmind-skill-api-keys.md`).
- Resolve configuration from explicit params or environment vars (`PARMIND_JWT`, `PARMIND_KB_TOKEN`, `PARMIND_API_KEY`).
- Internally instantiate `@sirius/apiconsumer` services with proper headers.

## 3. Markdown-Friendly Note Creation
- Expose `markdownToSlate(markdown: string)` utility (TS port of the Python helper or a new implementation) so callers can pass Markdown.
- `createNote` signature:
  ```ts
  createNote({
    kbId,
    title,
    markdownContent?,
    slateContent?,
    areas?,
    relations?,
    metadata?
  })
  ```
  - Validate inputs (must provide either Markdown or Slate JSON).
  - Convert Markdown to Slate automatically when needed before calling `apiconsumer.Node` service.
- Return structured result (`{ nodeId, kbId, link, createdAt }`).

## 4. Core Capability Surface (MVP)
1. **Notes**
   - `createNote(...)`
   - `getNote({ nodeId })`
   - `listNotes({ kbId, filters? })`
2. **Areas**
   - `listAreas({ kbId })`
   - `applyArea({ nodeId, areaId })`
3. **Search / Context**
   - `searchText({ kbId, query, limit? })` → uses search/TextChunk endpoint.
   - `getNodeContext({ nodeId })` → aggregates node, relations, areas.
4. **(Optional v2)**: Resource creation / uploads once ergonomics are defined.

Each function:
- Accepts typed inputs (zod schemas) and returns typed payloads.
- Throws typed errors (`AuthError`, `PermissionError`, `NotFoundError`, `RateLimitError`) for agent-friendly handling.

## 5. CLI Wrapper (Internal Tooling Aid)
- Entry file `libs/parmind-skill/bin/parmind-skill.ts` registered via `package.json` bin field (internal use only).
- Commands mirror library API:
  - `parmind-skill note:create --kb <id> --title "..." --markdown "file.md"`
  - `parmind-skill search --kb <id> --query "vector db"`
  - `parmind-skill area:list --kb <id>`
- Outputs JSON by default (human readable via `--pretty`).

## 6. Safety, Logging, Observability
- Wrap every call with a lightweight logger (pluggable) to capture `{ timestamp, kbId, method, duration, error? }`.
- Enforce request throttling/backoff via shared retry helper to respect Merlin rate limits.
- No admin endpoints; everything runs under the provided credentials/permissions.

## 7. Documentation & Tests
- `README.md` inside the lib covering:
  - Setup instructions
  - Auth configuration (JWT+KB tokens vs future API keys)
  - Usage snippets for library + CLI
  - Markdown vs Slate options
- Unit tests for utilities (markdown conversion, validation) and mocked API calls.
- Integration test harness (optional) hitting dev Merlin when creds available.

## 8. Future Enhancements
- Implement API key auth flow once backend endpoints exist (see `parmind-skill-api-keys.md`).
- Add higher-level helpers (e.g., `summarizeContext`, `recentChanges`).
- Consider an HTTP microservice façade if partners can’t run Node, reusing the same core library.
