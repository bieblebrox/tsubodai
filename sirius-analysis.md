# Parmind “Sirius” Monorepo Recon — 2025-03-02

## 1. Executive Summary
- Sirius is an Nx-managed Yarn 4 monorepo that bundles every Parmind surface: NestJS backend (Merlin), React/Vite web (Gravity, playground, content-editor, admin), Next.js marketing sites, a Chrome extension, a React Native mobile app (Magnetar), and supporting libraries/tools.
- Core knowledge infrastructure revolves around Merlin (Prisma + Postgres + Redis + Elasticsearch + BullMQ) with RAG, textraction, area graphing, and onboarding pipelines described in `project-description.md` and `apps/merlin/prisma/schema.prisma`.
- Shared libraries (`libs/apiconsumer`, `libs/interfaces`, `libs/store`, `libs/navimator`, `libs/textraction`, `libs/billund*`, etc.) provide typed API clients, global state, visualization, ingestion, and design system primitives re-used across clients.
- Local infra is orchestrated through root-level Docker Compose (merlin API, landing-pages “philae”, billund Storybook host, Elasticsearch+Kibana, Redis). Version bumping and release numbers are automated via `scripts/bump.sh`.
- `tasks/` contains a backlog of deep-dive plans (Elasticsearch→Postgres migration, onboarding flows, LangChain modularization, tool-based assistant, etc.), giving immediate visibility into upcoming architectural work.

## 2. Toolchain Snapshot
- **Package manager:** Yarn 4.2.2 (Plug’n’Play ready) with Node 22.x per workspace runtime.
- **Nx 21.0.2** orchestrates builds/tests for React, Next, Nest, React Native, Vite, Cypress, Playwright, Storybook, etc. Nx Cloud token already configured in `nx.json`.
- **Languages & frameworks:** TypeScript 5.7.x, React 19, Next.js 15.3, React Native 0.79, NestJS 10, Prisma 5.13, BullMQ 5, LangChain 0.2, Tauri 2 for the macOS desktop shell.
- **Testing stacks:** Jest + SWC for Node/React libs, Vitest for some UI libs (billund), Cypress for Gravity E2E (`apps/gravity-e2e`), Playwright config available via Nx plugin, Storybook 8.6 for component review, React Native testing via Testing Library + Jest.
- **Observability & analytics:** Sentry (web, RN, Nest), Amplitude (web + RN), Langfuse for AI tracing, Apitally instrumentation for Merlin.

## 3. Application Surfaces (apps/)
- **Merlin (apps/merlin)** — NestJS API + BullMQ task system + Prisma schema. Key components: `core/services/tasks` for job orchestration, scheduled tasks, vector/FTS storage split between Postgres + Elasticsearch (migration doc in tasks). Docker files for standalone deploy, README documents env layering and Stripe webhook simulation.
- **Gravity (apps/gravity)** — Primary customer web app built with React + Vite, Tailwind, TanStack Query, Redux/Zustand store, and Tauri wrapper for macOS (see `src-tauri`). README covers `nx serve`, `tauri:dev`, and build instructions.
- **Gravity E2E (apps/gravity-e2e)** — Cypress harness targeting Gravity with Nx `e2e` tasks.
- **Magnetar (apps/magnetar)** — React Native app with Nx-managed metro config, Android/iOS projects, RN-specific scripts (`start`, `run-ios`, `sync-deps`). Integrates `@shopify/flash-list`, purchases, Auth0, etc.
- **IO (apps/io)** — Chrome extension (CRXJS + Vite) that powers clipping/sharing. Ship scripts include packaging via `vite.config.mts` and `scripts/deploy-chrome.ts` (root script alias `deploy:chrome`).
- **Content Editor Web (apps/content-editor-web)** — Focused Vite-based environment for the Slate editor experience; shares UI primitives from `libs/billund` and state from `libs/store`.
- **Admin (apps/admin)** — React management console (placeholder README) likely re-using billund + apiconsumer for operator tooling.
- **Landing Pages (apps/landing-pages)** — Next.js multi-variant marketing sites (`PHILAE` container in docker-compose). README documents dev/build/start commands.
- **Playground (apps/playground)** — React sandbox for experimenting with new backend/lib features (project-description §2.5). Auth-enabled lab wired into navimator + textraction experiments.
- **Parmind AI (apps/parmind-ai)** — Currently a stub directory (no source yet) reserved for future dedicated AI agent interface.

## 4. Shared Libraries (libs/)
- **@sirius/interfaces** — Central TypeScript contract definitions consumed across apps/libs.
- **@sirius/apiconsumer** — Service-oriented API client library wrapping Merlin endpoints (Analytics, Area, KB, Parmenides, Upload, Subscription, etc.) plus shared env helpers; relies on interfaces for typing.
- **@sirius/store** — Cross-platform global state slices (areas, nodes, relations, time-machine, session, user, etc.) exported through platform-specific entry points (`index.web.ts`, `index.mobile.ts`, `index.io.ts`).
- **@sirius/navimator** — D3/SVG graph visualization toolkit for “minds” (label tree, relations). README notes ongoing refactor (`visualisation.v2.ts`) to decouple raw node data from renderable graph models.
- **@sirius/textraction** — Multi-source ingestion pipeline (YouTube transcripts, PDFs, websites, social content, OCR/image extraction). Entry point exposes utilities + per-source modules; used by Merlin tasks and clients.
- **billund / billund-mobile** — Design systems for web & RN, complete with Storybook workflows, Tailwind utilities, and notes on RN asset-loading limitations in Nx (issue #27408).
- **rn-modules** — Native bridges (MMKV app extension, share extensions, shared storage) vendored into Magnetar.
- **utils** — General-purpose helpers (TS/Jest scaffolding).
- **laznp-testing** — Placeholder trigger file (likely for CI checks).

## 5. Infrastructure & Operations
- **Docker Compose (`docker-compose.yml`)** spins up merlin API, landing-pages (`philae`), billund static host, Elasticsearch 8.3 + Kibana, and Redis with persistent volumes. Ports default to 3000–3001 for HTTP services and 9200/5601/6379 for data stores.
- **Dockerfiles** under `dockerfiles/` package merlin, landing-pages, and billund.
- **Nx targets** leverage plugin presets for Vite/React/Nest/Next/RN/Storybook/Cypress/Playwright; caching and remote Nx Cloud token already configured.
- **Env management** — Merlin README clarifies `.env.[target]` support (e.g., `.env.e2e-test`) and `NX_LOAD_DOT_ENV_FILES` toggle; Prisma still expects `.env` at app root.
- **Version bumping** — `scripts/bump.sh` hits a Nebulae Cloud Function to fetch the next semantic version and writes it to `.release-version` for builds.

## 6. Documentation & Planning Assets
- `project-description.md` captures product pillars, data model, and backend architecture (nodes/resources/relations/areas/minds, BullMQ queues, textraction, RAG, area graph, onboarding autopilot).
- `tasks/` directory contains targeted technical briefs (area confirmation flow, Elasticsearch→Postgres migration, onboarding simulator, LangChain modularization, AI agents, Supabase auth layer, etc.). These are ready-made references for upcoming feature work.

## 7. Opportunities / Next Steps
1. **Operational separation for tasks:** Merlin docs mention intent to move BullMQ & scheduled jobs off the API process. Spinning up a `worker` target + Docker service would formalize this.
2. **Elasticsearch retirement:** `tasks/ELASTICSEARCH_TO_POSTGRES_MIGRATION.md` + README notes make it a priority. Assess Prisma schema for vector columns and plan for pgvector migrations.
3. **Standardized READMEs:** Several apps (admin, IO, content-editor) lack up-to-date instructions. Creating short runbooks would reduce onboarding time.
4. **Document shared libs usage:** `interfaces`, `utils`, `store` could benefit from READMEs describing domain slices/interfaces rather than default Nx template text.
5. **Bootstrap Parmind AI stub:** Directory exists but empty—decide whether it houses agent orchestration UI, CLI, or service to avoid drift.

---

## 8. Parmind AI Submodule (Agno Onboarding Agent)
- Located under `apps/parmind-ai` (git submodule, branch `onboarding-agent`). Primary production surface right now is the **onboarding agent**, not the general-purpose agent.
- **Onboarding stack:**
  - `onboarding_agent_v2.py` builds an Agno `Agent` with OpenAI GPT‑4.1 (2025-04-14), Serper web search, ReasoningTools, and persistent `PostgresDb` session storage. It loads `prompts/onboarding_system_prompt_v2.jinja` and wires in custom `OnboardingTools`.
  - `onboarding-api.py` exposes FastAPI endpoints (`/api/onboarding/chat`, `/api/onboarding/progress`) with SSE streaming, tool-call telemetry (`ToolCallStarted/Completed`), and session-state bootstrapping. Authentication mirrors Merlin (Auth0 JWT + `X-Gloow-KB-Token`) via `auth/auth_service.py`.
  - Langfuse/OpenTelemetry instrumentation is pre-wired through OpenLIT for tracing and accurate token accounting.
- **Tooling model:** `tools/merlin_base_tools_v1.py` defines authenticated admin/user clients plus reusable primitives (`create_node`, `create_resource`, `apply_area_to_node`, etc.) and a `FrontendDisplayEvent` custom event for UI renders. `tools/onboarding_tools_v1.py` extends this with onboarding flows (`suggest_area`, `add_user_interest`, `set_usage_context`, `update_onboarding_stage`, `set_knowledge_base_name`, `get_onboarding_progress`). Admin endpoints are used for suggestion flows (nodes/resources/areas created with `suggestion=true`, `applied=false`).
- **Auth & safety:** `auth/auth_service.py` validates JWTs against the Auth0 signing cert + KB tokens via provided public key, guarding access control before each chat/progress request. `utils/auth_utils.py` handles dev bootstrap (grabs user JWT + KB token) for local runs.
- **Frontend integration:** `tools/tool_display_config.py` lists which tool calls should surface to users (e.g., show `suggest_area`, hide `add_user_interest`), enabling Gravity/Magnetar onboarding UIs to render live callouts. SSE responses from `/api/onboarding/chat` include structured `responseType` payloads (`text`, `tool_call_started`, `tool_call_completed`, `session_id`).
- **Session model:** Initial session state tracks `usage_context`, `user_interests`, `areas`, `nodes`, `kb_named`, etc., enabling deterministic progression through stages (usage context → interests → area creation → content gathering → naming → completed). Progress endpoint inspects this state to mark completion criteria (≥2 applied areas/nodes, KB named, interests captured).

_Compiled by Tsubodai on 2025-03-02 after first-pass codebase reconnaissance._
