# Parmind Skill Notes

- Whenever you update the CLI bundle (`parmind-cli.mjs`), make the change in the source library inside the Sirius monorepo first (`sirius/libs/parmind-skill`). Rebuild (`nx run parmind-skill:bundle-cli`) and copy the artifact into this skill. This keeps future compiles/builds in sync.
