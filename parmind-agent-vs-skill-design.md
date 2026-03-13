# Parmind AI vs. Parmind Skill — Design Directions

_Date: 2025-03-02_

## 1. Internal Parmind AI (Agno Onboarding / Full Agent)
**Audience:** first-party Gravity/Magnetar experiences and future in-product assistants.

### Design North Stars
- **Full-stack orchestration.** Keep the Agno + FastAPI + SSE stack so frontends can render rich visuals (area suggestion cards, tool progress). Preserve `FrontendDisplayEvent` patterns as the contract between backend and UI.
- **Elevated capabilities with guardrails.** Admin API access is acceptable because the UX supervises actions (e.g., suggestions flagged `suggestion=true`). Continue differentiating suggested vs. applied entities for safe user approvals.
- **Stateful journeys.** Persist onboarding/session state in Postgres via Agno’s DB hooks so conversations survive refreshes and can branch by stage (usage context → interests → areas → content → naming → done). Reuse this persistence layer when the “main” agent ships.
- **Deep observability.** Keep Langfuse/OpenTelemetry instrumentation in place; extend metrics around completion rates, tool success/failure, token usage, etc., since we own the full lifecycle.
- **Frontend-aware protocol.** Standardize the SSE payload schema (`text`, `tool_call_started`, `tool_call_completed`, `session_id`, etc.) and the `tool_display_config` registry so client teams can depend on stable event types.

## 2. Parmind Skill (Agent-facing Capability Layer)
**Audience:** any agent (internal or third-party) that needs to read/write Parmind minds without bespoke integrations.

### Design North Stars
- **Runtime-agnostic surface.** Ship a thin CLI / REST façade that wraps `@sirius/apiconsumer` (and later other services). All inputs/outputs must be JSON-friendly so LangChain, Crew, or custom agents can call it.
- **User-scoped auth only.** Require standard JWT + KB token, with a simplified option to use KB-scoped API keys (see `parmind-skill-api-keys.md`). No implicit admin rights; enforce the same permissions the human has in Merlin.
- **Minimal, composable commands.** Start with primitives—`note create`, `note fetch`, `search text`, `area apply`, etc.—that map 1:1 to Merlin endpoints. Return structured payloads (IDs, metadata, links) so agents can string together workflows.
- **Stateless & idempotent.** Avoid server-side conversations; let callers manage context. Keep endpoints idempotent where possible to stay safe for “fire-and-forget” automations.
- **Audit & rate control.** Log each invocation with user/kb identifiers and enforce throttles since we can’t trust external agents to behave. This keeps the API safe for general release.
- **Extensible spec.** Publish the CLI plus a simple HTTP spec so partners can integrate without adopting our runtime. Future enhancements (auto chunk retrieval, summarizers, browse helpers) should still operate within user permissions.

## 3. Bridging Strategy
- Internal agents can call the skill interface under the hood for parity, reserving admin-only flows for UI-supervised actions.
- Shared primitives ensure the “context layer” behaves consistently whether requests come from our own Agno orchestrations or foreign agents.
- Documentation should highlight which features require UI/first-party trust (admin writes, display events) versus the open skill API (user-scoped reads/writes).

---
Prepared by Tsubodai (⚔️)