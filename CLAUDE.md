# forceteki — project instructions for Claude Code

## Verification

Gate any engine change on lint plus the full suite in both modes, using the parallel forms:

```bash
npm run lint
npm run test-parallel
npm run test-parallel-undo
```

`test-parallel-undo` replays every spec through a snapshot rollback (`ENABLE_UNDO_ALL_TESTS=true`) and is the real gate for anything touching `server/game/core/snapshot/`, `GameObjectUtils.ts`, `GameObjectBase.ts`, or the ongoing-effect engine.
`npm run test-fast` skips part of the build and is for inner-loop iteration only; never use it as gating evidence.
Do not run `npm run benchmark` unless the task explicitly owns a performance capture (see `docs/plans/IMPLEMENTATION-ORDER.md`).

## Snapshot / save-load roadmap (`docs/plans/`)

Implementation units for the roadmap are defined in `docs/plans/IMPLEMENTATION-ORDER.md`; use its invocation blocks verbatim, including the `--fast` / `--tier N` routing and the `task_id`.
Anvil proof level for roadmap units marked 🔴 is `hardened`; `standard` otherwise.
Do not edit an existing benchmark scenario in `test/scenarios/undo/benchmark/BenchmarkScenarios.ts`, and do not redefine a headline benchmark (`manager/*`, `payload/*`, `sustained/*`) without saying so in the owning plan doc.
Roadmap commits go on `experimental/rollback-saves-optimizations`; the Anvil project log lives at `docs/plans/ANVIL-LOG.md`.

## Conventions

Card implementation and test guidance: `docs/implementing-cards.md`, `docs/testing-cards.md`, `docs/test-cheat-sheet.md`, `docs/debugging-guide.md`.
