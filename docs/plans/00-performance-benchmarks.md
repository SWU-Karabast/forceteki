# Plan 0 (Stage 0) — Performance Benchmark Tooling & Baseline Capture

**Status:** Implemented
**Depends on:** Nothing
**Unblocks:** Everything. No other plan can claim a win without this.
**Shape:** One PR — benchmark harness, benchmark spec, runner script, report
format, and the `initial-performance` capture.

## Goal

Build the measurement tools the rest of the roadmap is judged by, and capture a
baseline **before any plan work starts**.

The roadmap's whole premise is that the current snapshot system is too expensive
in two dimensions:

1. **Speed of operations** — how long a snapshot and an undo take.
2. **Memory and GC pressure** — how much the engine allocates and retains, and
   how much time the process loses to garbage collection. This is the term that
   has actually hurt in production: the current release carries a lot of memory
   overhead, and GC has at times run away and become a dominant cost.

Both must be measured the same way at the start and at the end, or the roadmap
cannot be shown to be a net win.

## What "ported" means here

The benchmark code comes from `feature/quick-undo-deltas-morph`
(`scripts/card-memory-benchmark.js` and its 780-line
`test/scenarios/undo/Performance.spec.ts`). That branch is ~300 commits behind
main and its spec is written against machinery that does not exist yet
(`DeltaTracker`, `rollbackToDeltaChain`, `createRecoverySnapshot`). Per the
README's standing guidance on the experimental branches, it was **reimplemented
on current main using the branch as a spec**, not rebased.

What carried over unchanged: the five board scenarios, the mutation model
(exhaust every eligible arena card), the setup/timed/reset memory split, and the
card-allocation memory script. What changed:

- Benchmarks target current APIs (`SnapshotFactory.createSnapshotForCurrentTimepoint`,
  `GameStateManager.rollbackToSnapshot`, `SnapshotManager.moveToNextTimepoint`).
- GC instrumentation was **commented out on the branch**. It is implemented here,
  because GC pressure is half of what this roadmap is being judged on.
- Memory accounting now includes `external`/`arrayBuffers`, not just `heapUsed`
  (see "Two corrections to the branch's method" below).
- Results are written as machine-readable JSON and rendered to markdown, so two
  captures can be diffed numerically instead of by eye.

## Deliverables

| Artifact | Purpose |
|---|---|
| `test/scenarios/undo/benchmark/BenchmarkHarness.ts` | Timing, memory sampling, GC attribution |
| `test/scenarios/undo/benchmark/BenchmarkScenarios.ts` | The five board setups (the comparability contract) |
| `test/scenarios/undo/benchmark/BenchmarkReport.ts` | JSON report accumulation + environment capture |
| `test/scenarios/undo/Performance.spec.ts` | The benchmarks themselves |
| `scripts/card-memory-benchmark.js` | Per-`Card` allocation floor across the whole dataset |
| `scripts/run-performance-benchmarks.js` | Build → run → render → capture, plus `--compare` |
| `docs/plans/performance/` | Captured reports, one per completed plan |

## Running it

```bash
npm run benchmark -- --name initial-performance
```

The suite is `xdescribe`d unless `RUN_PERF_BENCHMARKS=1`, so it never runs in CI
or in a normal `npm test`. The runner sets that, plus `--expose-gc` (the spec
hard-fails without it rather than silently reporting meaningless retained-memory
numbers), and writes both `<name>.md` and `<name>.json`.

To compare against an earlier capture:

```bash
npm run benchmark -- --name after-plan-03 --compare initial-performance
```

## Two corrections to the branch's method

Both were found while porting, and both would have made the captures wrong.

**1. `heapUsed` misses most of snapshot memory.** Snapshot payloads are `Buffer`s
produced by `v8.serialize` (`SnapshotFactory.ts:155-156`,
`GameStateManager.ts:136-141`). Buffer backing stores are counted in `external` /
`arrayBuffers`, **not** `heapUsed`. The branch reported `heapUsed` only. Measured
on `compact-board`, `createSnapshotForCurrentTimepoint` allocates ~53 KiB of heap
and ~48 KiB of external per call — reporting heap alone hides ~half the cost, and
hides essentially *all* of the retained-snapshot-chain cost (623 KiB of 661 KiB is
external). Every memory figure here is reported as heap, external, and total.

**2. Per-operation benchmarks structurally cannot measure GC.** They force a GC
before the loop and run 6–50 iterations, which is not enough allocation to
provoke natural collection. They report ~0 GC events *by construction*, which
reads as "no GC pressure" and is not. GC is therefore measured by a separate
`sustained/snapshotAndUndoCycle` benchmark: 400 iterations of snapshot → mutate →
rollback, retaining nothing, with no forced GC inside the loop. That is the row
to read for GC, and the report says so explicitly.

A third, smaller issue: the GC `PerformanceObserver` needs several event-loop
turns to drain. A single `setImmediate` reliably reports **zero** events after a
loop that produced ~60. `flushGcEventsAsync` yields until the count stops
growing.

## Benchmark tiers — and why this matters for comparability

The captures are only useful if the initial and final ones measure the same
thing. Plans 3 and 4 replace the serialization machinery outright, so benchmarks
pointed at today's internals will not survive. Benchmarks are therefore tiered:

| Tier | Rows | Stability contract |
|---|---|---|
| **Headline** | `manager/*`, `payload/*`, `sustained/*` | Measured at the public `SnapshotManager` seam. **Plans 1–6 must keep these comparable.** These decide whether the roadmap won. |
| **Diagnostic** | `full/*` | Measures the current full-snapshot implementation directly. Expected to change meaning or disappear at Plan 3/4. Useful for attribution, not for the verdict. |
| **Standalone** | card-allocation memory | Per-`Card` byte floor. Plan 5 moves this. |

If a plan must change a headline benchmark's meaning, that is a plan-level
decision to call out in its own doc — not something to quietly do in the spec.
Same for the scenarios: **changing an existing scenario invalidates every prior
capture that used it.** Add a new one instead.

## What each benchmark measures

| Benchmark | Tier | What it tells you |
|---|---|---|
| `manager/moveToNextTimepoint(Action)` | Headline | Per-action cost the engine pays on every action boundary, including unused-GameObject cleanup |
| `manager/rollbackTo(Manual)` | Headline | End-to-end undo latency through the public API, including container bookkeeping |
| `sustained/snapshotAndUndoCycle` | Headline | GC events, GC pause share, and allocation under sustained play |
| `payload/fullSnapshotTotal` | Headline | Bytes persisted per snapshot, and bytes per live GameObject |
| `payload/retainedChain(13 snapshots)` | Headline | Memory pinned by a realistic held snapshot chain — the O(live objects × retained snapshots) term |
| `full/createSnapshotForCurrentTimepoint` | Diagnostic | Full-snapshot anchor cost in isolation |
| `full/buildGameStateForSnapshot` | Diagnostic | The GameObject-state serialization share of that cost |
| `full/rollbackToSnapshot` | Diagnostic | Raw restore cost with no container bookkeeping |
| card-memory | Standalone | Retained bytes per `Card` object across the full dataset |

`retainedChain` uses 13 snapshots to match the README's ground-truth finding that
a real game accumulates ~13+ live snapshot buffers across the action, phase, and
quick containers.

## Capture protocol (applies to every later plan)

1. When a plan lands, run `npm run benchmark -- --name after-plan-NN --compare initial-performance`.
2. Commit `docs/plans/performance/after-plan-NN.md` **and** `.json`. The JSON is
   the source of truth; the markdown is generated and must not be hand-edited.
3. Note anything that would distort the comparison (machine change, scenario
   added, headline benchmark redefined) in the plan's own doc.

The **initial vs. after-plan-04** delta is the roadmap's performance
deliverable — Plan 4 (delta snapshots) is the last plan whose thesis is
performance; Plans 5 and 6 are save/load-oriented and their captures are
no-regression checks. Intermediate captures exist
so a developer can see which plan moved which number, and to catch a plan that
regresses something silently. A plan is not required to improve every number —
Plan 3, for instance, is expected to trade build-time complexity for runtime cost
— but a regression in a headline benchmark should be stated in the plan's doc
rather than left for the final diff to surface.

## Known measurement caveats

- **Timing is noisy; memory and payload are not.** Two back-to-back captures of
  *identical* code differ by up to ~20% on individual timing rows (measured:
  `manager/moveToNextTimepoint(Action)` on `large-board` moved -20.3%,
  `full/rollbackToSnapshot` on `compact-board` moved +9.6%). Over the same two
  runs, every `payload/*` row was identical to 0.0% and per-operation memory
  moved by <1.5%. **Do not read a sub-20% timing delta on a single row as a
  result.** A real speed win shows up as a consistent move across scenarios and
  across both avg and p95; memory and payload deltas can be trusted at much finer
  resolution.
- **Local machine, not CI.** Absolute numbers are only comparable within the same
  machine and Node version; the report header records both. Compare captures taken
  on the same hardware, or treat cross-machine deltas as directional only.
- **`retainedMemoryDelta` is noisy and occasionally negative.** It is a
  before/after forced-GC comparison across a whole loop, so unrelated collection
  can dominate. Treat it as a leak signal, not a measurement.
- **Undo mode.** `test/helpers/IntegrationHelper.js:78` passes `UndoMode.Full`,
  which is not a member of the `UndoMode` enum (`Disabled | Request | Free`), so
  benchmarked games would otherwise run with `undoMode === undefined`. The spec
  pins the mode to `Free` via `setUndoConfirmationRequired(false)` so it measures
  the real undo-enabled path. **The underlying helper bug is not fixed here** —
  it belongs with Plan 1's housekeeping item.
- **Private-field access.** `captureAnchorSnapshot` reads
  `SnapshotFactory.currentActionSnapshot` directly so payload sizes and rollback
  costs reflect the object the engine actually builds rather than a
  reimplementation. It throws with a pointed message if the field disappears, per
  Invariant 4 (no silent degradation).

## Explicit non-goals

- **No CI gating or regression thresholds.** These benchmarks are too
  machine-sensitive to fail a build on. If per-commit regression detection is
  wanted later, it needs a dedicated stable runner, and that is its own plan.
- **No profiling replacement.** These are aggregate benchmarks. For attribution,
  use the existing `server/utils/profiler.ts` CPU/heap capture endpoints.
- **No full-game replay benchmark.** A scripted long game would be the most
  faithful macro-benchmark, but it is fragile against card and prompt changes.
  The `sustained/*` benchmark covers the GC question without that maintenance
  burden.
