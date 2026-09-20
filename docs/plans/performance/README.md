# Performance captures

Benchmark captures for the snapshot/undo roadmap. Tooling and method are
described in [Plan 0](../00-performance-benchmarks.md).

## The roadmap's comparison target is `pre-roadmap-baseline`, not `initial-performance`

`initial-performance` was captured on an i9-13900HX under Node v22.11.0. Every capture since has been taken on a Ryzen 7 9850X3D under Node v24.13.0. Under rule 2 below that makes every roadmap delta measured against it directional only, and a control run has since shown the machine change is large enough to account for whole plans' worth of apparent movement: the harness was run on the current machine at `26c1a8391`, the direct child of `initial-performance`'s own commit `ca6c30b1`, which adds only docs and the benchmark harness and so measures byte-identical engine code. That run came out at `manager/rollbackTo(Manual)` -20.4% mean, `full/rollbackToSnapshot` -36.2% mean, `sustained/snapshotAndUndoCycle` -9.4%, every `payload/*` row identical. Nothing but the hardware and the runtime changed.

`pre-roadmap-baseline` replaces it as the roadmap's comparison target. It is the same machine and Node version as every later capture, and it sits at `3dcaecdb0`, the direct parent of the first plan-work commit `512a62113`, so everything between it and a later capture is plan work and nothing else.

`initial-performance.{json,md}` stays in place and must not be overwritten. It is cited by SHA in committed plan docs, and it is now the historical record of the cross-machine problem rather than a live comparison target.

## Captures

| Capture | Taken at | Taken after | Notes |
|---|---|---|---|
| [`initial-performance`](initial-performance.md) | `ca6c30b1` | Nothing — baseline on `main` before any plan work | **Retired as a comparison target**, see above. i9-13900HX / Node v22.11.0; 2202 cards in the dataset, so its `bytesPerCard` is not comparable with any later capture either |
| [`pre-roadmap-baseline`](pre-roadmap-baseline.md) | `3dcaecdb0` | Nothing — the direct parent of the first plan-work commit | **The roadmap's comparison target.** Ryzen 7 9850X3D / Node v24.13.0, 2386 cards, matching every capture below. Six replicate runs were taken and the committed files are the run whose overall timing profile sits closest to the arm's median; only the capture's `name` field was renamed from its run name, no measured value was touched. The six-run min/max per row is the uncertainty band every delta below is read against |
| [`after-plan-01`](after-plan-01.md) | `deb54b46f` | Plan 1 (snapshot hygiene, work items A-E) minus its last engine commit | Against `pre-roadmap-baseline`, `manager/rollbackTo(Manual)` moved -9.3%, -4.6%, -2.3%, -3.2%, -6.0% across the five scenarios, and every one of the five sits inside the baseline's own six-run range. The independent replicate arm puts the median across all 30 timing rows at +0.1% with one row outside the noise floor. **Plan 1's effect on timing is not measurable at this sample size**, and whatever it is, it is several times smaller than the -10% to -22% improvement previously claimed in this row — that figure, and the report's own `--compare initial-performance` section, were artifacts of the machine change. What Plan 1 did move is memory: rollback memory/op fell 4.9% to 6.9% in four of five scenarios (`compact-board`, whose rollback-memory row is the noisiest, gives -0.1% here and -2.4% in the replicate arm), and `sustained/snapshotAndUndoCycle` memory/op fell 11% to 37% in all five. Both replicate, and both clear the ~1.5% run-to-run spread of the memory rows by a wide margin |
| [`after-plan-01-replicate`](after-plan-01-replicate.md) | `5787a3314` | Plan 1 complete, including the last engine commit | A replicate arm, not a new claim. `after-plan-01` was captured one engine commit short of the end of Plan 1; this capture closes that gap and gives Plan 1 a second independent measurement. Six runs; confirms the `after-plan-01` reading in both directions — timing median +0.1% across 30 rows against the baseline with one row outside the noise floor, memory/op down 2.4% to 6.8% on the rollback rows and 11% to 35% on the sustained rows |
| [`after-plan-02`](after-plan-02.md) | `9b55eaf01` | Plan 2 (semantic save/load v1, work items A-E) | Plan 2 was expected to move nothing on the hot path. Memory says otherwise, clearly: against the Plan 1 arm, rollback memory/op is up 7.9% to 10.1% and `sustained/snapshotAndUndoCycle` memory/op up 14% to 55% in every scenario, against a ~1.5% spread. That roughly cancels Plan 1's saving and leaves `pre-roadmap-baseline` → `after-plan-02` memory at a median +1.2%. Timing is less certain but points the same way: `manager/rollbackTo(Manual)` is up 6.7% to 21.0% in all five scenarios with an overall median of +8.3%. Consistent direction across scenarios is the bar rule 4 sets, but each row's own within-arm spread (16% to 59%) is wider than the effect, so the honest reading is a **possible small regression worth re-measuring, not an established one**. Payload rose +0.2% in every scenario, consistent and real but negligible. Two cautions about this particular file: the run behind it was an unusually fast one, giving three `rollbackTo(Manual)` rows below the baseline's entire six-run range, and the `+463%` `compact-board` sustained-memory figure in its own comparison section is a machine artifact — the same row against `pre-roadmap-baseline` is -2.2%. The header `capturedAt` field was normalised to midnight after generation; all measured data is exactly as produced |
| [`after-plan-02-replicate`](after-plan-02-replicate.md) | `ce083a972` | Plan 2 complete | A replicate arm. `server/` is byte-identical to `9b55eaf01`, so this measures the same engine code as `after-plan-02` and exists only to give it a second sample. One representative run of six; the arm's six-run band is what the Plan 2 deltas above are read against, and it is a good deal less flattering than the single `after-plan-02` run |
| [`after-plan-03`](after-plan-03.md) | `d73fac593` | Plan 3 complete (codegen state serializers, Phases A and B) | Against `pre-roadmap-baseline`, every headline rollback/snapshot row improved: `full/rollbackToSnapshot` -44.0% to -58.7%, `manager/rollbackTo(Manual)` -48.5% to -59.7%, `payload/retainedChain` bytes-per-snapshot -13.0% to -17.4%, and `sustained/snapshotAndUndoCycle` GC pause time down 6x-8x (pause count up slightly, from more-frequent-but-much-cheaper collections now that snapshots are live object graphs instead of `v8`-serialized `Buffer`s). This plan's own risk note ("JSON-record snapshots are larger in memory than v8 buffers") did not materialize — see `03-codegen-serializers.md`'s `P3-PB3` capture analysis for the full breakdown, including the two near-flat exceptions (`forty-cards-per-player`'s `manager/moveToNextTimepoint(Action)` +6.2% and `full/buildGameStateForSnapshot` +10.6%, both inside or barely outside the single-run noise floor) and the caveat that these are single-run timing numbers, not a replicated arm. The `payload/gameStateBuffer`/`gameObjectStatesBuffer`/`fullSnapshotTotal` rows changed meaning at `P3-PB2` (now a v8-serialized-equivalent size of the retained JSON record, not stored bytes — see their `notes.measurement` tag) and are not directly comparable to earlier captures' versions of those rows; `payload/retainedChain` is unaffected and remains the load-bearing memory row. **Card-memory benchmark omitted** (`--skip-card-memory`): the current card dataset includes two Fortify upgrade cards (`insurgent-camp`, `landing-pad`) with legitimately-`null` `upgradeHp`/`upgradePower`, which `scripts/card-memory-benchmark.js`'s data normalizer doesn't default, tripping `InPlayCard`'s constructor assertion — a pre-existing benchmark-tooling gap unrelated to Plan 3, flagged separately for a fix |

Add a row when a plan lands.

## Taking a capture

```bash
npm run benchmark -- --name after-plan-01 --compare pre-roadmap-baseline
```

This builds the test output, runs the benchmark suite with `--expose-gc`, runs
the card-allocation benchmark, and writes two files:

- `<name>.json` — machine-readable, **the source of truth**
- `<name>.md` — generated report, **do not hand-edit**

Both should be committed with the plan that produced them.

Options: `--label "<note>"` records a free-text note in the header,
`--skip-build` reuses `build/`, `--skip-card-memory` skips the card benchmark.

If you are switching commits in a worktree to take several captures, delete `build/` between them. `tsc` does not remove output for files that no longer exist at the new commit, and a stale compiled spec from a later commit will be loaded by the jasmine helper glob and fail the run.

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
   in each report's environment table. Cross-machine deltas are directional only, and in practice not even that — see the control run described at the top of this file.
3. **Do not hand-edit the markdown.** Regenerate it from the JSON. Deltas quoted in prose belong in this index or in the Anvil log, read out of the `.json` files; they never go into a generated report.
4. **The timing noise floor is roughly ±18%, so a timing delta is only a finding if it survives replication.** Three back-to-back runs of identical code, nothing changed between them, gave a min-to-max spread of 17.6% of the median on the typical `avgMs` row and 49.7% on the worst, with 14 of 30 rows above 20%; `p95Ms` was worse at 19.6% typical and 64.7% worst. Interleaving a clean rebuild between runs, as a multi-commit comparison must, widens that further. A single-run timing delta below about 20% on one row carries no information at all, and even a consistent-looking pattern across scenarios needs a replicate arm before it is worth writing down.
5. **Memory and payload can be trusted at much finer resolution than timing.** Across the same three runs, payload bytes were identical (0.0% typical, 0.3% worst) and memory/op moved 0.3% typical and 7.3% worst. A consistent 5% memory movement across all five scenarios is a real result; a 15% timing movement across all five is not.
6. **Report uncertainty, not point estimates.** Every capture is one run. Quote the delta together with the replicate band it has to clear, and if it does not clear it, say that the change is not measurable at this sample size rather than quoting the number as a result.

The `pre-roadmap-baseline` → after-plan-04 delta is the roadmap's performance
deliverable — Plan 4 (delta snapshots) is the last plan whose thesis is
performance; Plans 5 and 6 are save/load-oriented and their captures are
no-regression checks. Intermediate captures exist so a developer can see which
plan moved which number, and so a silent regression gets caught when it happens
rather than at the end.

Plans 1 and 2 are the standing evidence that the timing half of that deliverable is not reachable at one run per capture. Six replicate runs per arm were needed before Plan 2's rollback-timing increase even became visible as a consistent direction, and it still does not clear its own rows' spread. Memory and payload, by contrast, gave clean answers for both plans from a single run each. If Plan 4's thesis is to be judged on time rather than bytes, its capture needs replicate runs, not a single capture and a `--compare`.

## Raw runs

`.raw/` holds the per-run intermediate JSON the renderer consumes. It is not
intended to be committed or read directly.
