# TOOLS.md — Tsubodai's Cheat Sheet

## Parmind — Planning Areas

Run `area:list --pretty` at the start of the first planning session and fill these in.

| Area | ID |
|---|---|
| Planning | cmn4hexuk00cpeu5e06du2eh6 |
| Short Term | cmn4hf2wb00cteu5erpp7if6m |
| Quarterly Targets | cmn4hfa2f00cyeu5eda5zmunc |

## Parmind — Note Naming Conventions

| Type | Title format | Example |
|---|---|---|
| Weekly plan | `Plan: YYYY-WNN` | `Plan: 2026-W13` |
| Quarterly goals | `Goals: Q[N] YYYY` | `Goals: Q2 2026` |
| Decision log | `Decision: YYYY-MM-DD <slug>` | `Decision: 2026-03-23 agent-stack` |

## Linear (MCPorter)

Config: `skills/linear/mcporter.json` · requires `LINEAR_API_KEY` + `MCPORTER_CONFIG` (set on the `linear` skill in `openclaw.json`).

```bash
# List tools / signatures (use --all-parameters for full create_issue fields)
skills/linear/scripts/linear-mcp.sh list linear

# Example call (adjust tool + args after listing)
skills/linear/scripts/linear-mcp.sh call linear.list_issues query="your search" team=<TEAM_KEY> --output json
```

## Quick Invocation

```bash
# All parmind commands (from workspace root)
node skills/parmind/scripts/parmind-cli.mjs <command> [options]

# Skill self-update
node skills/parmind/scripts/update.mjs
```
