# Parmind Skill Notes

## Updating

Pull the latest release from GitHub:

```bash
node skills/parmind/scripts/update.mjs
```

Requires `GITHUB_TOKEN` in the parmind skill env block in `openclaw.json`
(read access to `NebulaeSoft/sirius`).

## Adding New Assets

If the release gains new filenames, add them to `ASSET_MAP` in
`scripts/update.mjs` (asset filename → local relative path from skill root).
