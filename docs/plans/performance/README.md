# Performance captures

Benchmark captures for the snapshot/undo roadmap. Tooling and method are
described in [Plan 0](../00-performance-benchmarks.md).

## Captures

| Capture | Taken after | Notes |
|---|---|---|
| [`initial-performance`](initial-performance.md) | Nothing — baseline on `main` before any plan work | The comparison target for the whole roadmap |

Add a row when a plan lands.

## Taking a capture

```bash
npm run benchmark -- --name after-plan-01 --compare initial-performance
```

This builds the test output, runs the benchmark suite with `--expose-gc`, runs
the card-allocation benchmark, and writes two files:

- `<name>.json` — machine-readable, **the source of truth**
- `<name>.md` — generated report, **do not hand-edit**

Both should be committed with the plan that produced them.

Options: `--label "<note>"` records a free-text note in the header,
`--skip-build` reuses `build/`, `--skip-card-memory` skips the card benchmark.

## Reading a capture

Two things are being tracked, and they carry equal weight:

- **Speed** — `Avg` and `p95` per operation. `p95` is the one that matters for
  undo latency; `Avg` is the one that matters for per-action snapshot cost.
- **Memory / GC pressure** — allocation per operation (heap **and** external, since
  snapshot payloads are `Buffer`s and are invisible to `heapUsed`), memory pinned
  by a held snapshot chain, and the share of wall time lost to GC pauses.

Read `sustained/snapshotAndUndoCycle` for GC. The per-operation benchmarks force
a GC before their loop and run too few iterations to provoke natural collection,
so their near-zero GC numbers are an artifact of the method.

`manager/*`, `payload/*` and `sustained/*` are measured at the public
`SnapshotManager` seam and stay comparable across the whole roadmap. `full/*`
measures current internals and is expected to change meaning once Plans 3 and 4
land.

## Comparability rules

1. **Do not edit an existing scenario** in `BenchmarkScenarios.ts`. It invalidates
   every prior capture that used it. Add a new scenario instead.
2. **Compare captures from the same machine and Node version.** Both are recorded
   in each report's environment table. Cross-machine deltas are directional only.
3. **Do not hand-edit the markdown.** Regenerate it from the JSON.
4. **Do not read a sub-20% timing delta on a single row as a result.** Two
   back-to-back captures of identical code produced timing swings of up to ±20%
   on individual rows, while every payload row was identical and per-operation
   memory moved <1.5%. Timing wins have to be consistent across scenarios and
   across both avg and p95 to mean anything; memory and payload can be trusted at
   much finer resolution.

The initial → after-plan-04 delta is the roadmap's performance deliverable —
Plan 4 (delta snapshots) is the last plan whose thesis is performance; Plans 5
and 6 are save/load-oriented and their captures are no-regression checks.
Intermediate captures exist so a developer can see which plan moved which
number, and so a silent regression gets caught when it happens rather than at
the end.

## Raw runs

`.raw/` holds the per-run intermediate JSON the renderer consumes. It is not
intended to be committed or read directly.
