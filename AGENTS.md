# 90s Diary Archive — Codex Instructions

## Project Context

This repository contains the 90s Diary Archive, a Next.js and TypeScript
application for browsing an archive of diary entries documenting the
Buenos Aires underground electronic music scene of the 1990s.

Before making changes, inspect the relevant existing implementation,
types, dependencies, and surrounding code.

Do not assume the architecture or dependencies from the task description
alone; verify them against the current repository.

## General Development Principles

- Use the project's existing architecture, conventions, components,
  utilities, and patterns wherever practical.
- Prefer small, focused changes over broad refactoring.
- Do not substantially refactor unrelated code while implementing a feature
  or fixing a bug.
- Do not introduce new abstractions, dependencies, or architectural patterns
  unless they provide a clear benefit over the project's existing approach.
- Preserve existing behaviour unless the task explicitly requires changing it.
- Keep TypeScript types explicit and consistent with the existing project.

## Diary Content Protection

The diary content is archival source material and must be treated separately
from application code.

- Do NOT modify diary CSV data unless explicitly requested.
- Do NOT rewrite, correct, normalise, translate, or otherwise alter diary
  content as part of an unrelated development task.
- Do NOT modify generated diary-entry content merely to support an application
  feature unless explicitly requested.
- Do NOT modify the diary content-generation pipeline unless inspection of
  the repository shows that it is genuinely necessary for the requested task.
- If a requested application feature appears to require changing diary source
  data or the generation pipeline, explain why before making that change.

## Scope Control

Only modify files relevant to the requested task.

If you discover an unrelated issue while working:

- do not fix it automatically;
- mention it in the final report instead.

Avoid opportunistic cleanup or refactoring of unrelated code.

## Dependencies

Before adding an npm package:

1. Inspect the existing dependencies.
2. Determine whether the requirement can reasonably be implemented using
   existing project dependencies or platform/browser functionality.
3. Add a new dependency only when it provides a clear benefit.

Report any dependency additions or version changes and explain why they
were necessary.

Do not perform unrelated package upgrades as part of another task.

## Git Safety

- Inspect the current branch and working-tree status before modifying files.
- Do not overwrite unrelated uncommitted user changes.
- Use the branch specified by the task when one is provided.
- Do NOT commit unless explicitly requested.
- Do NOT merge unless explicitly requested.
- Do NOT push unless explicitly requested.
- Do NOT modify `main` when the task specifies work should happen on a
  feature branch.

## Validation

After making code changes, run the appropriate existing validation commands
where practical.

This may include:

- TypeScript checks
- project build
- relevant tests
- linting

Do not automatically attempt broad unrelated fixes if validation reveals
pre-existing failures.

Distinguish between:

- failures introduced by the current changes; and
- failures that were already present in the repository.

## Completion Report

After completing a development task, report:

- what was implemented;
- files created;
- files modified;
- dependencies added or changed;
- validation commands run;
- validation results;
- warnings, limitations, or unresolved issues;
- any manual configuration or testing still required.

Do not commit, merge, or push the implementation unless explicitly requested.