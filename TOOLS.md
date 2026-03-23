# TOOLS.md — Tsubodai's Cheat Sheet

## Parmind — Planning Areas

Run `area:list --pretty` at the start of the first planning session and fill these in.

| Area | ID |
|---|---|
| Planning | _(populate after area:list)_ |
| Short Term | _(populate after area:list)_ |
| Mid Term | _(populate after area:list)_ |

## Parmind — Note Naming Conventions

| Type | Title format | Example |
|---|---|---|
| Weekly plan | `Plan: YYYY-WNN` | `Plan: 2026-W13` |
| Quarterly goals | `Goals: Q[N] YYYY` | `Goals: Q2 2026` |
| Decision log | `Decision: YYYY-MM-DD <slug>` | `Decision: 2026-03-23 agent-stack` |

## Quick Invocation

```bash
# All parmind commands (from workspace root)
node skills/parmind/scripts/parmind-cli.mjs <command> [options]

# Skill self-update
node skills/parmind/scripts/update.mjs
```
