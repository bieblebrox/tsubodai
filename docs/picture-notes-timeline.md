# Picture Notes Android Timeline

## Week 1 — Prototype & Plumbing (current week)

**Goals**
- Ship an Android-first Picture Notes prototype that talks to Merlin end-to-end.
- Ensure existing Picture Notes users can migrate data automatically when emails match.

**Engineering (Robby + RN devs)**
- PAR-578 ▸ Bootstrap RN project, Android tooling, Merlin API base client.
- PAR-579 ▸ Wire Auth0 Google login (Merlin tenant) with migration trigger hook ready for Robby’s backend.
- PAR-580 ▸ Deliver capture+upload flow per Figma (camera, gallery import, metadata, error handling).
- PAR-581 ▸ Implement notes list & grid UI with pull-to-refresh and detail view.
- PAR-577/576 ▸ Robby finalizes backend data-transfer + mapping so migrated notes appear immediately.

**Josh**
- Decide on pricing model direction so downstream tickets can be framed (even if final numbers wait for Week 2).

**Dependencies**
- Robby’s migration flow must be callable from the RN app right after login and capture uploads.

## Week 2 — Design Polish, AI, Monetization

**Goals**
- Tighten UI/UX with Olesya’s guidance and land the first AI and monetization surfaces.

**Engineering**
- Apply Olesya’s final design guidelines across auth, capture, lists, and areas.
- Implement AI Agent v1 inside the RN app (PAR-582 scope: auto-organisation + chat with notes powered by Merlin AI).
- Build pricing/paywall flow (reuse Gravity/Magnetar patterns) once Josh’s pricing model is settled.

**Josh**
- Provide the finalized design kit from Olesya as soon as she’s back.
- Lock pricing tiers + paywall copy so the implementation can proceed without rework.

## Week 3 — Final Polish, Testing, Upgrade Path

**Goals**
- Treat this as stabilization week: refine UX, run heavy QA, and plan the migration from the legacy Picture Notes app.

**Engineering**
- Iterate on any remaining design tweaks; ensure Android build matches the final Figma spec pixel-perfect.
- Comprehensive QA pass (device matrix, offline, edge cases) plus instrumentation/analytics checks.
- Define and implement the upgrade path from the old Picture Notes app (deep links, data carry-over, store listing updates).

**Josh**
- Review QA findings, sign off on release candidate, coordinate comms for existing Picture Notes users.

## Milestone Checkpoints
- **End of Week 1:** Prototype demo showing login, picture capture, list/grid, and migrated historical notes.
- **End of Week 2:** Design-polished build with AI Agent v1 + functional paywall.
- **End of Week 3:** Release-ready build after QA + migration story locked.

Let me know if you want this broken down further by assignee, or mirrored into Linear projects/sprints.