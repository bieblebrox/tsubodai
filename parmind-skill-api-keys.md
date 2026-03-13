# Parmind Skill API Keys — KB-Scoped Access Design

_Date: 2025-03-02_

## Goal
Provide long-lived API keys that agents can use to access a single Parmind knowledge base (KB) with a predefined permission set—without juggling user JWT + KB token.

## Key Model
- **Format:** `pk_<env>_<identifier>.<secret>` (e.g., `pk_live_ab12cd34.EfGhIj...`).
- **Storage:** Only the hashed secret is stored server-side, along with:
  - `kbId`
  - `permissions` (read/write/upload)
  - `createdBy` user / agent label
  - `status` (active, revoked)
  - `lastUsedAt`, `usageCount`

## Authentication Flow
1. Client sends header: `Authorization: ParmindKey <identifier>.<secret>`.
2. Backend splits ID + secret, hashes the secret, and looks up the record.
3. Validate:
   - Key exists and is active
   - `kbId` on key matches the request scope
   - Permissions allow the requested action
4. Proceed with request under that KB context.

## Management Endpoints (to add to Merlin / skills API)
- `POST /skills/api-keys` → owners create a key with `{ kbId, permissions }`.
- `GET /skills/api-keys` → list keys (masked secrets) with metadata.
- `POST /skills/api-keys/{id}/revoke` → immediately disable a key.
- `POST /skills/api-keys/{id}/rotate` (optional) → issues a new secret.

## Security Measures
- Encourage manual rotation (e.g., UI reminders every N days).
- Optional IP allowlists or agent labels for extra control.
- Rate-limit per key to stop runaway agents.
- Log every request with key ID + KB for auditing/analytics.

## Optional Enhancements
- **JWT Bridge:** Expose `POST /skills/api-keys/{id}/token` to mint short-lived JWTs from a key if we want extra protection.
- **Scoped Metadata:** Allow optional tags ("marketing-research-bot") for better monitoring.

---
Prepared by Tsubodai (⚔️).