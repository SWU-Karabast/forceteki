# Plan 8 — Performance Regressions After Plan 4

**Status:** proposed, not started.
Plans 5 to 7 are on hold pending team discussion; this plan depends only on landed work (Plans 0 to 4) and does not touch their scope.

## Goal

Find out which of the regressions recorded in [Plan 4's verdict](04-delta-snapshots.md) ("Verdict (P4-G)", "What got worse") are real costs to a running game, locate the change that caused each real one, and fix the ones worth fixing.
The plan is measurement-first: no engine change is planned until a measurement has confirmed a regression and located its cause, because several of the recorded rises are changes in what a benchmark row measures rather than changes in what the engine does, and the largest one rests on a statistic that cannot carry it.
The first question it answers is the one that matters for players: against `main` as it stands, what does this branch change?

## What the P4-G verdict recorded as worse, triaged

| # | Recorded | Real cost to a game? | Why | Unit |
|---|---|---|---|---|
| 1 | `manager/moveToNextTimepoint(Action)` p95 against the same-runtime pre-roadmap commit (`p4-g-reference-pre-roadmap`): +18.6%, +57.3%, +68.8%, +110.0%, +36.4% | unconfirmed | The row's p95 is the single slowest sample in the three 40-card scenarios: the harness takes the `ceil(0.95 n)`-th value (`BenchmarkHarness.ts` `percentile`) and those scenarios time 10 to 15 calls, so p95 equals `maxMs`; the rise is smallest in compact-board, whose n is 50, and the avg against the same commit is not measurable. The operation is the full snapshot build that production repeats at every full snapshot (phase starts, bridges, every non-action-phase snapshot); the tracking-run start inside it (`startTracking`, `markTrackingAnchor`) happens only at game start and after a load. The location is also open: on single runs the forty-cards-per-player p95 step after `d30824a12` (+44%) is larger than the step before it (+17%), and the range before it contains the main merge `e0c708dcd` (196 commits), not only plan work. `after-plan-03` showed `forty-cards-per-player` `full/buildGameStateForSnapshot` avg at +10.6% (p95 +74.5%) against the baseline, single runs on Node v24. | R-0, then R-1 |
| 2 | `payload/retainedChain(13 snapshots)` +346% to +419% and `retainedChainWithWrites` +127% to +266% against `after-plan-04-memo` | not in production | Since P4-F every manual snapshot is an unshared full materialization. No production code in `server/` takes a manual snapshot: `Game.takeManualSnapshot` is called only from test code (the harness in `test/helpers/IntegrationHelper.js` and specs such as `ArmedSaveTrigger.spec.ts`). The production retained form is `payload/retainedActionChain(13 snapshots)`, about 1.1 to 4.6 KB per snapshot taken. | none; recorded here so it is not re-opened |
| 3 | `sustained/snapshotAndUndoCycle` allocation per operation against `after-plan-04-memo`: +124.4% in large-board, +44.2% in forty-cards-sparse-mutations, falling in the other three | probably not | The row never pushes a quick-container entry, so age eviction never runs and it retains about 400 index deltas. The metric itself is a heap difference across each timed call with natural collections inside the loop (band 20719 to 103873 in forty-cards-per-player), so it cannot decide this on its own. | R-2 |
| 4 | A `generateToken` delta window is 1.4 to 2.6 KB (about 2.6 KB in the 40-card scenarios), against about 0.1 to 1 KB for ordinary windows | small but real | `Player._decklist` is one `@stateValue`, and `Player.addGeneratedTokenToDecklist` replaces it whole, so the window records the whole old decklist (0.7 to 1.3 KB of the window). This is the collection-copy caveat Plan 4 named, now measured. Retention is bounded by the live caps (3 history snapshots and 3 delta entries per player) except during item 5's streak. | R-3 (optional) |
| 5 | The delta index grows by one delta per action while one player acts alone (20 actions retain 2.2 to 20.9 KB against 0.5 to 5.2 KB alternating) | small but real | The quiet player's live delta entry pins the eviction horizon. Bounding it may remove that player's quick undo, which is an owner decision recorded in Plan 4's Open issues. | out of scope here |
| 6 | Not in the P4-G verdict; found reviewing the captures. `full/rollbackToSnapshot` allocation per operation +20% to +49% against `pre-roadmap-baseline` (434 to 505 KiB against 310 to 382 KiB; directional, cross-runtime), and +30% to +40% against the same-runtime `p4-g-reference-pre-roadmap` | probably not | The step is +30% to +44% between `after-plan-02-replicate` and `after-plan-03`, both Node v24, so Plan 3 carries it, and the row has stayed within 5% since (`p4-d-reference-pre-memo` to `after-plan-04`). The production seam `manager/rollbackTo(Manual)` allocates 3% to 8% less than the baseline, and the sustained GC pause share fell about 3x. | none; R-0's Stage 2 confirms the step on Node v26 if it runs |

## Units

### S-0 — Catch the branch up with `main`

Prerequisite for R-0, and not a measurement unit.
At the time of writing `origin/main` is 32 commits past the merge base `445792e61` and the branch is 83 commits past `main`.

- Merge `main` into the branch, resolve conflicts, and gate on `npm run lint`, `npm run validate-cards`, `npm run validate-specs`, `npm run test-parallel`, `npm run test-parallel-undo`, `npm run test-parity` and `npm run test-parity-undo` (the last two check the state serializers, which the conflicted classes below feed).
- A dry merge (`git merge-tree --write-tree HEAD origin/main`) currently conflicts in `package-lock.json` and five state-decorated classes (`AbilityLimit.ts`, `CloneUnitEffect.ts`, `CopyStandardTriggeredAbilitiesEffect.ts`, `GainAbility.ts`, `GainNonKeywordAbilitiesFromUnitEffect.ts`): `main` rewrote fields as inferred-type `@stateValue` initializers where the branch moved them to `@stateMap`. Every such conflict resolves to the branch's decorator with `main`'s initializer style; taking `main`'s side would compile and pass most tests while silently moving snapshot-tracked fields back to `@stateValue`.
- Record the conflict list and `git show --cc` of the merge in this plan. Any non-merge edit made to pass lint (`main`'s newer lint may flag branch code outside the conflict list) goes in a commit separate from the merge.
- Record the synced `main` commit (call it `M`) and the commit that passes the gates (call it `B`: the merge commit, or the last fix commit on top of it), and check that `git diff M B -- server/` contains only roadmap work; R-0 Stage 1 compares exactly these two.
- `M` is frozen once recorded: no further `main` merge lands on the branch until R-0 Stage 1 and any R-1 before-and-after run are complete. If one becomes unavoidable, record a new pair (`M'`, `B'`) and redo Stage 1 on it; no comparison mixes points from two pairs.

Done when: `B` is committed with every gate green, and `M` and `B` are recorded in this plan.

### R-0 — Confirm, then locate, the first-snapshot regression (measurement only)

The existing rows cannot settle item 1, so R-0 starts by adding a measurement that can, spends it first on the comparison that matters to players (`main` against this branch), and goes further only if that comparison shows a regression.

**The probe.**
A new spec file (not `Performance.spec.ts`, which Plan 4 froze after the `after-plan-04` capture; see "As landed in P4-G") in its own `describe`, with its own report path, times one operation: `moveToNextTimepoint(Action)` followed by an untimed `clearAllSnapshots`, the same first-snapshot build the headline row times, on the three 40-card scenarios.
The probe pins the undo mode itself with `setUndoConfirmationRequired(false)`, as `Performance.spec.ts` does, because `integration()` leaves the snapshot manager in `Disabled` on `main` (its helper passes the non-existent `UndoMode.Full`, `origin/main:test/helpers/IntegrationHelper.js:78`) and `moveToNextTimepoint` returns before building anything in that mode (`SnapshotManager.ts:116`); it asserts `game.isUndoEnabled` and a non-null `snapshotManager.currentSnapshotId` after the first timed call, on every point.
It takes at least 200 timed samples per scenario and reads avg and p50 as the deciding statistics, with p95 secondary.
Both calls are public `SnapshotManager` methods on `main` and at every branch point below, and `BenchmarkScenarios.ts` is identical from `3dcaecdb0` to `cdfc22c8e`, so the spec file applies unchanged on the branch.
`main` has neither the benchmark harness (`test/scenarios/undo/benchmark/`) nor the runner, so `M` and `e0c708dcd^2` also get the branch's harness files copied in, and every point, `B` included, gets the probe spec copied in as part of its patch; whether they compile against `main`'s `SnapshotManager` is the first thing Stage 1 checks.
The runner (`scripts/run-performance-benchmarks.js`) hard-codes the benchmark filter, one report path and a missing-report error, so each point also gets a runner patch that runs the probe alone and writes its report; that patch and the probe's harness entry point are settled at R-0's plan gate.
The probe exercises the first snapshot of a tracking run (no memo, no open window), not the full snapshots a running game takes inside a tracking run, so every located step also records which of the two its changed code runs on (see Done when).

**Run hygiene, for every stage.**
- Build each point once in its own scratch worktree outside the repository, each with its own `build/` and a `test/json` generated by that commit's own `npm run get-cards` (record the card count; it changes across the main merge), following the repair `p4-g-reference-pre-roadmap`'s README row records (`tsc` run directly where the newer `@types/node` breaks the build script).
- Run the probe alone, one run at a time, with `ENABLE_PARITY_HARNESS`, `ENABLE_UNDO_ALL_TESTS` and `MEASURE_SAVE_DEGRADATION` unset, at least six runs per point, in a counterbalanced order: rotate the order of the points each run and reverse every second run.
- Commit every probe report as decision evidence, named `p8-r0-<commit>-run<N>`, so each median and band can be re-derived, with one README row per point.

**Reading rule.**
A step between two adjacent points (for Stage 1, `M` and `B`) counts as a regression only if the later point is slower and its six-run median avg or p50 differs by more than 20 percent, and the min-max bands of that same statistic's per-run values do not overlap, in at least two of the three 40-card scenarios; conditions are evaluated per scenario, and the count includes only scenarios that satisfy both; a faster later point is recorded as an improvement and does not start Stage 2.
Otherwise it is "not located at this sample size", and the unit says so rather than naming a culprit.

**Stage 1, the gate: `main` against this branch.**
Probe `M` and `B` from S-0.
Both carry every `main` change, so the only difference between them is the roadmap's work.
Stage 1 compares one call that is a different operation on each side: on `M` it is the build every snapshot takes (one `v8.serialize` of all state), on `B` it is the build that starts a tracking run, after which snapshots are delta windows. A rise therefore says the first build got slower, not that a game got slower, so Stage 1 records beside it the per-game product on each side: the snapshots a scripted game takes times `M`'s avg, against that game's full builds times `B`'s avg plus the delta-row cost measured on `B`.
If the difference does not clear the reading rule, item 1 is recorded as "no regression against `main` at this resolution" and R-0 stops.

**Stage 2, location (only if Stage 1 shows a regression).**
- Probe every remaining point unconditionally: `3dcaecdb0` (pre-roadmap), `5787a3314` (Plan 1 complete), `ce083a972` (Plan 2 complete), `d73fac593` (Plan 3 complete), `b0bf874c9` (the branch tip just before the first main merge), `e0c708dcd^2` (the `main` commit that merge brought in, so `main`'s own change and the merge itself can be told apart), `e0c708dcd` (the main merge, 196 commits), `d30824a12` (P4-0b, P4-1, P4-A and P4-B), `a2fd76e3a` (P4-C and P4-Cb, the first point with memoization and the memoized rows) and `cdfc22c8e` (Plan 4 complete).
- Probe `M` and `B` again in Stage 2's rotation, so every point shares one session. `e0c708dcd^2` is the current merge base (`445792e61`), so `e0c708dcd^2` to `M` isolates `main`'s own change since the first main merge, and `cdfc22c8e` to `B` is the S-0 merge; both are reported with the `main`-caused steps and left out of the roadmap sum.
- No same-runtime series covers the main merge and Plan 4, so no point is skipped on the strength of older captures; the Node v24 series (`pre-roadmap-baseline`, `after-plan-01(-replicate)`, `after-plan-02(-replicate)`, `after-plan-03`) is read against itself only, as context for the Plan 1 to 3 steps. Seven of these points also have an existing capture, which is context, not data, because its deciding statistic is a single maximum.
- Bisect by commit inside each step that clears the reading rule.
- The located steps must account for the Stage 1 difference. A step whose cause is `main` (the `e0c708dcd^2` point against the pre-roadmap line, and the merge step itself) is reported separately and left out of that sum, because Stage 1 holds `main` constant. If the remaining roadmap steps do not account for the Stage 1 difference, the unit reports the regression as cumulative and R-1 profiles `M` and `B`.
- Run the full benchmark once per point probed in this stage, only to read `full/rollbackToSnapshot` allocation per operation for item 6 (memory reads at the 10 percent rule), with P4-G's `Performance.spec.ts` applied at `cdfc22c8e`, where the unmodified file aborts at `full/rollbackToSnapshot`; commit one full-benchmark report per point.
- `full/buildGameStateForSnapshot` is read for attribution only: it is a single `v8.serialize` of the state bags at `3dcaecdb0`, per-object codegen records from Plan 3 on, and memo-aware from P4-C on, so a step across Plan 3 is built into the row.

Done when: the plan doc records the Stage 1 result and, if Stage 2 ran, the located boundary or boundaries, or "not located at this sample size", or "cumulative", with the per-point medians and bands inlined; and, for each located step, (i) whether the changed code runs on a production full snapshot inside a tracking run or only at tracking-run start, and (ii) the step in ms multiplied by the number of full snapshots a scripted game takes at the located commit.
Does not change: any engine file, any existing spec, or `Performance.spec.ts`.

### R-1 — Profile and fix the located cause

Runs only if R-0 located a step or found a cumulative rise, and only if its per-game cost is above a threshold the owner sets at R-1's plan gate. Scope is set by that result and gets its own plan gate; nothing here is pre-approved.

- CPU-profile the full first-snapshot path (`node --cpu-prof` around a loop of `createSnapshotForCurrentTimepoint` after `clearAllSnapshots` on the `forty-cards-per-player` board) at the commit R-0 located and its parent (or the two end points for a cumulative rise), and diff the self-time by function.
- Candidates, all hypotheses until the profile says otherwise: the Plan 3 codegen serializers' per-object record build; an interaction between `main`'s changes on the build path and the roadmap's code; and, depending on where the step lands, P4-A's `startTracking` call (the `e0c708dcd` to `d30824a12` step), or, only if the cause lies after `a2fd76e3a`, P4-E's `markTrackingAnchor` and the second cull inside `buildGameStateForSnapshot` that the factory's own first-statement cull made redundant.
- Gate a fix on `npm run lint`, `npm run test-parallel` and `npm run test-parallel-undo`, plus a replicated before-and-after run of R-0's probe.

Done when: the probe's deciding statistics are back within R-0's reading rule of the median of the point before the located step, re-run interleaved with the fix arm in the same session, or the plan doc records why the remaining cost is the price of a Plan 3 or Plan 4 guarantee.

### R-2 — Settle the sustained-allocation reading

- Add a new probe, in R-0's spec file or its own and not in `Performance.spec.ts`, that runs the snapshot-and-undo cycle the way a game does: `takeSnapshot(Action)` with quick-container entries, alternating players (so it does not reproduce item 5's streak), restoring through `SnapshotManager.rollbackTo` rather than a raw restore (so containers and index stay consistent), and asserting `isDeltaIndexEvictionEnabled`.
- The decider is deterministic, not a heap difference: the index size (`deltaSnapshotIndex.size`) and the retained delta bytes after the cycle, read as `payload/deltaIndexStreak` reads them. If the index stays bounded and the retained bytes match the caps, item 3 is recorded as a benchmark artifact in Plan 4's verdict and closed.
- If the deterministic reading shows growth, item 3 is reopened as a real regression, which then needs a location step; the deterministic reading exists only from `f59dc15ca` (P4-E), so its comparison points are `f59dc15ca` and its parent, with the allocation reading only at `a2fd76e3a` or `d30824a12`.

Done when: item 3 is either closed as an artifact or reopened with a located cause.

### R-3 — Shrink the token window (optional)

Only if the team wants per-action memory reduced further.

- The tracker records the whole old value of a collection on its first write in a window, so splitting `Player._decklist`'s `tokens` and `allCards` into their own state arrays would still record both old arrays, and `allCards` is most of the decklist; a split alone does not shrink the window to an append. Any option that does (an append-only token log, or a decklist that holds only ids already in another tracked collection) changes the state shape and needs `npm run generate-serializers` and a save/load check against Plan 2's format.
- Before the gate, measure the candidate on a branch with the existing `payload/deltaSizeDistribution` `generateToken` probe, and decide on live retained bytes and per-action allocation, since retention is bounded by the caps outside item 5's streak.
- Option B is to leave the shape and accept about 2.6 KB per token-generating action.

Done when: the plan doc records the option chosen with its measured window bytes, and a chosen shape change has landed with its gates green.

## Ownership and capture rules

- Plan 8 owns its captures, so its capture-taking units (R-0, R-1's before-and-after, R-2) need rows in `IMPLEMENTATION-ORDER.md`'s capture table as sanctioned capture owners, with invocation blocks, before any of them runs `npm run benchmark` or the probe.
- No Plan 8 capture relies on `payload/deltaIndexStreak` for any claim, and each README row Plan 8 adds says so. Plan 8 reads "reads" in Plan 4's item-5 trigger ("before the next performance capture that reads `payload/deltaIndexStreak`") as "relies on for a claim", and records that reading in Plan 4's Open issues at R-0's plan gate, so the trigger is not reached by this plan.

## Non-goals

- The one-player index streak (item 5): owned by Plan 4's Open issues and its pending owner decision.
- Manual-snapshot retention (item 2): no production caller.
- Any change to an existing benchmark row, scenario or iteration count, or to `Performance.spec.ts`; new probes go in new spec files.
- Anything in Plans 5 to 7.

## Verification

- S-0 is gated on lint, validate, the full suite in both modes and the parity suites in both modes.
- R-0 and R-2 are measurement units: their evidence is the committed runs and the reading rule above, and they change no engine file.
- R-1 and R-3 change engine code and are gated on lint, the full suite in both modes, and a replicated probe run, as every engine change in this roadmap is.
- Every claim rests on a same-machine, same-runtime comparison (capture-index rule 2); the Node v24 series is read only against itself, and a cross-runtime figure, where one is quoted for context, is labelled directional.
