# Plan 8 — Performance Regressions After Plan 4

**Status:** S-0 has landed (merge, test-only fix and lint fix; `M` and `B` are recorded in "As landed in S-0"); R-0's Stage 1 has run and reads improvement (`B`'s first snapshot of a tracking run is 24 to 33 percent faster on avg than `M`'s in all three 40-card scenarios, so no regression against `main` at this resolution), and R-0's Stage 2 is not run (see "As landed in R-0").
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

#### As landed in S-0

- **Synced `main` commit `M`:** `d5e4d1cac81f2e46260dcc4476d18621256621d2`, 60 commits past the merge base `445792e61`; the branch was 84 commits past that base. `M` is frozen: no further `main` merge lands until R-0 Stage 1 and any R-1 before-and-after run are complete.
- **Commits:** merge `b98ea4fa9` (parents `1ebb15aa5` and `M`); test-only fix `43cddc751`; **gate-passing commit `B`:** `9f650b6dd` (the lint-fix commit on top of the test-fix commit).
- **Conflicts (nine) and one adaptation:**

  | Path | Kind | Resolution |
  |---|---|---|
  | `package-lock.json` | lock | `main`'s lock plus exactly the `ts-morph` 28.0.0 closure the branch's `package.json` adds (77 inserted lines against `main`, no deletion, `name` still `forceteki`); `npm ci` installs from it (679 packages, exit 0) |
  | `server/game/core/ability/AbilityLimit.ts` | state-decorated | the branch's `@stateMap` with `main`'s inferred `= new Map<string, number>()` initializer (2 fields; the two `@statePrimitive` fields (`isRegistered`, `useCount`) take `main`'s `= false` and `= 0`) |
  | `server/game/core/ongoingEffect/effectImpl/CloneUnitEffect.ts` | state-decorated | `@stateMap` with `main`'s initializer style (4 fields) |
  | `server/game/core/ongoingEffect/effectImpl/CopyStandardTriggeredAbilitiesEffect.ts` | state-decorated | `@stateMap` with `main`'s initializer style (1 field) |
  | `server/game/core/ongoingEffect/effectImpl/GainAbility.ts` | state-decorated | `@stateMap` with `main`'s initializer style (1 field; the `@statePrimitive` `_abilityIdentifier` takes `main`'s `= ''`) |
  | `server/game/core/ongoingEffect/effectImpl/GainNonKeywordAbilitiesFromUnitEffect.ts` | state-decorated | `@stateMap` with `main`'s initializer style (3 fields) |
  | `server/game/core/gameSteps/ActionWindow.ts` | not decorated | union: the branch's `isPlayerDecisionPrompt` override and `PromptButtonArg` signature plus `main`'s menu-command availability assertion |
  | `server/gamenode/GameServer.ts` | not decorated | union: `main`'s expanded schema import list plus the branch's `MatchLoadError`, `ISavedMatch`/`IEngineOnlyFact` and `getUserWithDefaultsSet` imports |
  | `test/server/gamenode/auth/authorization/RouteAuthManifest.ts` | not decorated | union: both `session-token` and `developer` in the `RouteAccess` type and doc list; both the `/api/create-user` and `/api/dev/load-saved-match` rows |

  One adaptation the plan did not list: `server/utils/user/UserFactory.ts` merged cleanly but no longer compiled (`main` dropped `import type { User }`, the branch's `getExistingUserByIdAsync` uses it); the import is restored in the merge commit. `git show --remerge-diff` shows it, `--cc` does not.
- **Field check:** the eleven `@stateMap` fields are `@stateMap() … = new Map<K, V>()`; the staged diff of the five files against `main` is exactly 22 `@state` lines, the eleven `@stateValue` removals match the eleven `@stateMap` additions after normalization (empty diff); the `@stateValue` file/count list over `server/` equals the pre-merge list; the normalized decorator inventory of `server/` and `test/` is identical to the tip's (366 lines); the generated serializer body is byte-identical to the pre-merge copy and `GENERATED_SCHEMA_SURFACE_HASH` is still `95ebd3141d807f70e15164d3397eb92f589454c7958927cdc8625dd77a7fe037`.
- **`git diff M B -- server/` contains only roadmap work:** the paths that differ between `M` and `B` equal the paths the branch changed since the merge base (245 over the whole tree, 113 under `server/`; both difference lists empty), and the changed-line residue under `server/` is exactly: the eleven `@stateMap … = new Map<K, V>()` lines against the branch's annotated form and their eleven `@stateValue` partners, the `isMenuCommandAvailable` signature pair, the `import type { User } from './User';` line, and the lint-fix lines of `StateWatcherDeserializer.ts` and `WatcherEntryEncoding.ts` (type aliases rewritten as `Record`). Every residue line is type-level and erased in emitted JavaScript, so `M` and `B` run the same server code outside the roadmap's own changes.
- **Red gates fixed, test-only (the owner's choices at the plan gate and after the first implementation attempt):** `validate-specs` and the two parity suites were red on the pre-merge tip, and `DevMatchLoad` and `ManifestSweep` leaders pair 4 turned red on the merge; the control run on the merged tree reproduced all of them before the fix. Fixes: `'Undo'` added to `undoScenarioSpecsWithOwnHarness` in `scripts/validateSpecs.ts` (the spec reaches the harness only through `undoIntegration`); `withParityHarnessSuspended` added to `test/helpers/ParityHarness.ts` and used, through a local `withRollbackTrafficSuspended`, around the four rollbacks of the three `SnapshotMemoization` pre-pass AC10 cases whose `serialize` traffic they count or hit (the harness's own round-trip had added to it); a `getUserFactory: () => null` stub member in the `DevMatchLoad` gamesEnabled case (main's `authMiddleware` resolves it when built); a `phaseTransitionHandler` in `ManifestSweep`'s leader-pair setup that dismisses the view-only "View cards for" prompt Grand Admiral Thrawn opens as the Action phase starts. No assertion was removed or weakened; one assertion was added (the harness is installed after the suspension exactly as before it). The `ManifestSweep` failure is spec-side: the leader sample is seeded over the whole implemented leader pool, the tip baseline `test-parity.log` reports a pool of 175 and the merged tree's run 178, so the sample changed; neither the Thrawn card nor `test/helpers/IntegrationHelper.js` changed on `main`.
- **Gates on `B`:**

  | Command | Result | Specs | Against the tip |
  |---|---|---|---|
  | `npm run lint` | exit 0 | none | tip: exit 0 (this merge's lint-fix commit repairs 29 errors that `main`'s newer typescript-eslint reports in seven branch files) |
  | `npm run validate-cards` | exit 0 | 2121 card files, 2098 test files | tip: exit 0 |
  | `npm run validate-specs` | exit 0, 25 exempt | 2238 game-group and 55 non-game files | tip: 1 violation (`Undo.spec.ts`) |
  | `npm run test-parallel` | exit 0, 0 failures | 10857 | tip: 10394, 0 failures |
  | `npm run test-parallel-undo` | exit 0, 0 failures | 9736 | tip: 9475, 0 failures |
  | `npm run test-parity` | exit 0, 0 failures; zone and delta-zone counters 0; `rollbacksFailed` 1, `harnessRestoreErrors` 0 | 10857 | tip: 3 failures (the AC10 cases) |
  | `npm run test-parity-undo` | exit 0, 0 failures; zone and delta-zone counters 0; `rollbacksFailed` 2, `harnessRestoreErrors` 0 | 9736 | tip: 3 failures (the AC10 cases) |

  All seven exit 0. Counters are read from the four per-worker `pid-*.delta.log` files of each run's directory, not from the stdout exit lines (which carry three of four workers). The S-0 record commit after `B` changes only this plan document and the docs named in D and E, which no gate reads, so these results hold for the branch head.
- **`git show --cc`:** the verbatim output for the non-lock files is in "Appendix: S-0 merge record". `package-lock.json` is summarized there with the command that reproduces it. `git show --remerge-diff --name-only` of the merge lists the ten hand-touched paths.

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

#### As landed in R-0

R-0 ran Stage 1 only.
Against `main`, the branch's first snapshot of a tracking run is not slower: the reading rule's verdict is **improvement**, so Item 1 is closed for `M` against `B`, and no Stage 2 runs.
Nothing was committed to the engine, to an existing spec, or to `Performance.spec.ts`.

**Settled at the plan gate.**
- **Entry point.** The card harness `integration(...)`, with the undo mode pinned by `setUndoConfirmationRequired(false)` straight after `setupTestAsync` and before any timed call.
  The correction to the probe paragraph above: `integration()` passes `UndoMode.Disabled`; `undoIntegration` passes `UndoMode.Full`, which does not exist on `main`, so its value is `undefined` and `GameFlowWrapper`'s default parameter (`undoMode = UndoMode.Free`) turns it into `Free` by accident; the branch's helper passes `Free` explicitly.
  `integration()` needs no new exemption in `scripts/validateSpecs.ts`, and the pin makes every harness path run the same call.
  The spec counts, on every timed iteration, how often `game.isUndoEnabled` is false, `currentSnapshotId` is null and the current Action snapshot is hollow, and expects each count to be 0.
- **Runner.** A new script, `scripts/run-first-snapshot-probe.js`, run from the repository against a built worktree (`--worktree`), never copied into a worktree, and not a flag on `scripts/run-performance-benchmarks.js`.
  It builds nothing, runs jasmine with `--filter=FirstSnapshotProbe` under `--expose-gc`, forces `RUN_PERF_BENCHMARKS=1`, `NODE_ENV=test` and a raw-report path, removes `ENABLE_PARITY_HARNESS`, `ENABLE_UNDO_ALL_TESTS`, `MEASURE_SAVE_DEGRADATION` and `FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS` from the environment, and refuses a report when the log lacks `Ran 4 of` and `4 specs, 0 failures` or shows any `[...Verifier]`, `[...Gate]` or `[...Harness]` banner, or when the compiled spec is older than its source.
  It stamps provenance (worktree HEAD and status, sha256 of the spec, both harness files and itself, Node, run round and position, jasmine exit, wall time) and never overwrites a report.
- **Gate variables.** The spec is pending unless `RUN_FIRST_SNAPSHOT_PROBE=1`, and then throws unless `RUN_PERF_BENCHMARKS=1` (or the control-only `FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS=1`) is set, `global.gc` exists, and the three scrubbed variables are unset.
- **Samples.** 400 timed iterations and 20 warm-ups per row.
- **Scripted game and delta-row source.** The `forty-cards-per-player` board; two rounds in which each player makes three space-unit attacks (the opposing base when it is a legal target, otherwise the first legal target), each round followed by `moveToNextActionPhase()`.
  Counts come from wrapping `SnapshotFactory.prototype.createSnapshotForCurrentTimepoint` (snapshots taken and hollow snapshots) and `GameStateManager.prototype.buildGameStateForSnapshot` (full builds), restored in a `finally`, with the same code on both sides.
  The delta-row cost is a companion row in the same probe, `moveToNextTimepoint(Action, withWrites)`: clear, one untimed first snapshot, then per iteration an untimed toggle of the scenario's exhaustible arena units and a timed Action snapshot.
  The scripted game is the last `it` and the only one that wraps a prototype, so no timed loop runs after a prototype swap.
  Each report also records, per scenario, `lastGameObjectId` and the live `GameObject` count after setup and after the first snapshot call (a warm-up call), and `heapUsedBytesAtStart` (after a forced GC) in its environment block.

**The points.**
- `M` is `d5e4d1cac81f2e46260dcc4476d18621256621d2` and `B` is `9f650b6dd70816f73c317b0cb211e0bb5ac1273d`, each in its own scratch worktree outside the repository with the checkout's `node_modules` linked in and its own `npm run get-cards`.
- Both `get-cards` runs wrote 2560 card definition files with `card-data-hash.txt` `15f6b2aaf05dcfe2cfaabd3dcd913c015ea38d54cb63998ff97627a5d07acc75`, and `diff -rq` of the two `test/json` trees reported no difference (the checkout's own `test/json/Card` holds 2564 entries, so the scratch count is the one that applies).
- Each worktree was built once with `node scripts/build-test.js` after the final spec was copied in (and, at `M`, the repository's `BenchmarkHarness.ts` and `BenchmarkScenarios.ts`, which `M` lacks); both builds exited 0 with no `tsc` diagnostic, so the probe spec and the copied harness compile against `main`'s `SnapshotManager` unchanged.
- Machine and runtime: Node v26.13.0 (V8 14.6.202.34-node.40), AMD Ryzen 7 9850X3D 8-core (16 logical), win32 x64, 33,913,405,440 bytes of memory.
- All twelve reports carry the same sha256 for the spec (`edc4df1f…`), `BenchmarkHarness.ts` (`f49ae420…`), `BenchmarkScenarios.ts` (`d568433c…`) and the runner (`3470ea51…`); the process order was `M B B M M B B M M B B M` (odd rounds `M` first, even rounds `B` first), one process at a time, with only Context7 MCP node processes present beside it.

**The confound.**
On the branch, the verifier hooks (`SnapshotMemoVerifier`, `DeltaChainVerifier`, `DeltaParityGate`) wrap `GameStateManager.prototype.buildGameStateForSnapshot` in every jasmine process unless `RUN_PERF_BENCHMARKS` is set, and `main` has none of them.
The control run at `B` with the hooks on (`FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS=1`, `RUN_PERF_BENCHMARKS` unset) printed the verifier banners (the log is retained and the runner's log guard rejects it) and read about 3.5 to 4.4 times the benchmark-mode first-build avg in the same session (0.78, 0.70 and 0.70 ms against 0.22, 0.16 and 0.17 ms, taken from the control run's console report; the raw report was not kept).
Every number below was taken in benchmark mode with the hooks off.

**Stage 1 result** (`first snapshot of a tracking run`, `moveToNextTimepoint(Action)` then an untimed `clearAllSnapshots`; six runs per point; median of six is the mean of the third and fourth sorted values; band is min to max; change is later over earlier).

| Scenario | avgMs `M` median (band) | avgMs `B` median (band) | Change | Bands overlap | Counts |
|---|---|---|---|---|---|
| forty-cards-per-player | 0.3012 (0.2468 to 0.3128) | 0.2300 (0.2235 to 0.2406) | -23.6% | no | faster |
| forty-cards-sparse-mutations | 0.2595 (0.2222 to 0.2842) | 0.1871 (0.1776 to 0.2068) | -27.9% | no | faster |
| forty-cards-four-mutated | 0.2614 (0.2156 to 0.2794) | 0.1756 (0.1706 to 0.1905) | -32.8% | no | faster |

| Scenario | p50Ms `M` median (band) | p50Ms `B` median (band) | Change | Bands overlap | Counts |
|---|---|---|---|---|---|
| forty-cards-per-player | 0.2696 (0.2205 to 0.2864) | 0.2244 (0.2132 to 0.2490) | -16.7% | yes | no |
| forty-cards-sparse-mutations | 0.2180 (0.1980 to 0.2557) | 0.1656 (0.1502 to 0.2068) | -24.1% | yes | no |
| forty-cards-four-mutated | 0.2299 (0.1916 to 0.2583) | 0.1513 (0.1388 to 0.1951) | -34.2% | yes | no |

Object counts (lastGameObjectId / live count) agree to within one live object (live count) and within four ids (lastGameObjectId) between the sides (forty-cards-per-player 518 / 275 on `M`, 515 / 276 on `B`; the analyzer prints all six scenario-point pairs), and the process heap at start is about 369 MB on `M` and 423 MB on `B`; neither is large enough to account for the difference.

Scenarios counting as slower: 0; as faster: 3 (all three on avg, none on p50).
**Verdict: improvement.**
There is no regression against `main` at this resolution: no scenario is slower on either statistic, so the rule for Item 1 does not fire and R-0 stops after Stage 1.
The improvement is a statement about the call, not about a game: on `B` the call builds a full snapshot and starts tracking, on `M` it builds a full snapshot.
Limit on the size of the improvement: it shrinks across the rounds in forty-cards-per-player (per-round avg change -28.5%, -25.7%, -24.4%, -22.8%, -18.3% and -2.7% for runs 1 to 6, with `M`'s avg falling from 0.3128 to 0.2468 ms and `B`'s rising from 0.2235 to 0.2402 ms), so the six-run medians are the rule's reading, not a stable size, and no cause is claimed for the drift.
The verdict does not rest on that scenario: forty-cards-sparse-mutations and forty-cards-four-mutated show no such trend across runs and each counts as faster on avg, which is the two scenarios the rule needs.
On avg the sign is the same in all six rounds in every scenario, but the size is not, and the 20 percent line is crossed on avg and not on p50; on p50 `B` reads slower than `M` in single rounds (forty-cards-per-player run 6, 0.2490 against 0.2205 ms; forty-cards-sparse-mutations run 4, 0.2068 against 0.1980 ms), which the overlapping p50 bands already show.
`companion avg` (`moveToNextTimepoint(Action, withWrites)`, median of six): `M` 0.2784, 0.2555 and 0.2585 ms (full builds); `B` 0.0080, 0.0077 and 0.0077 ms, hollow in all 420 snapshots in every scenario and run, which is why it is used as the delta-row cost.
The hand derivation of forty-cards-per-player from the committed reports (medians, bands, change and overlap, avg and p50) equals the analyzer's output.

**Per-game product** (scripted game on forty-cards-per-player, identical across all six runs of each point; the counts are in the reports' `scriptedGame` blocks).

| Side | Snapshots taken | Full builds | Hollow snapshots | Final phase | Base damage (p1, p2) |
|---|---|---|---|---|---|
| `M` | 29 | 29 | 0 | action | 6, 12 |
| `B` | 29 | 13 | 16 | action | 6, 12 |

Both sides take the same 29 snapshots with the same per-timepoint counts (17 `action/action`, and 2 each of `endOfPhase/action`, `startOfPhase/regroup`, `regroupResource/regroup`, `regroupReadyCards/regroup`, `endOfPhase/regroup` and `startOfPhase/action`).
Unit costs (forty-cards-per-player six-run medians): `M` first build 0.3012 ms avg (0.2696 p50); `B` first build 0.2300 ms avg (0.2244 p50); `B` companion 0.0080 ms avg (0.0057 p50).
`M` side: 29 x 0.3012 = 8.73 ms (7.82 ms with p50).
`B` side: 13 x 0.2300 + 16 x 0.0080 = 3.12 ms (3.01 ms with p50).
The break-even full-build fraction is 1.32 on avg (1.21 on p50): above 1, so no mix of full builds and hollow snapshots makes `B` cost more than `M` on these unit costs.
Cross-check against P4-G's `full/moveToNextTimepoint(Action, memoized)` (a hollow checkpoint with captured writes; six-run medians 0.0175, 0.0134 and 0.0110 ms for forty-cards-per-player, sparse-mutations and four-mutated at `cdfc22c8e`, a different session): the probe's companion row reads 0.0080, 0.0077 and 0.0077 ms, the same order of magnitude and about 30 to 40 times below a full build, but not equal; the cross-session reading is directional only.
Limits: the game is short, so its phase mix is not a real game's; the product excludes the per-write capture cost (0.002 to 0.009 ms per window, P4-G "Index streak and hook cost") and everything outside the snapshot call, so it is not a game-level timing; and `B`'s 13 full builds are priced at the tracking-run-start cost (no memo, with `startTracking`), which makes `B`'s product an upper bound.
The counts and unit costs are reported so a reader can rescale them.

**Stage 2 and the other items.**
Stage 2 did not run: the verdict is an improvement, which the reading rule says does not start it, and the owner had also deferred it at the plan gate.
No probe or benchmark report exists for any commit other than `d5e4d1cac` and `9f650b6dd`.
Triage item 6 (`full/rollbackToSnapshot` allocation per operation) was not read, because it is read only by Stage 2's full benchmarks.
Item 1 therefore reads: not a regression against `main` at this resolution, and not located because there is nothing to locate; R-1 has no input from this unit.

**Reports.**
`docs/plans/performance/p8-r0-d5e4d1cac-run1.json` to `-run6.json` (`M`), `p8-r0-9f650b6dd-run1.json` to `-run6.json` (`B`) and `p8-r0-stage1-reading.json` (the analyzer's output on them, from `scripts/analyze-first-snapshot-probe.js --earlier d5e4d1cac --later 9f650b6dd`); the spec, the runner and the analyzer are `test/scenarios/undo/FirstSnapshotProbe.spec.ts`, `scripts/run-first-snapshot-probe.js` and `scripts/analyze-first-snapshot-probe.js`.
The reports are JSON only, with no generated Markdown, and are decision evidence for this plan, not plan captures.

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

## Appendix: S-0 merge record

Commands that reproduce this record on the merge commit `b98ea4fa9`:

- `git show --cc --format= b98ea4fa9 -- . ':!package-lock.json'`
- `git show --cc --format= b98ea4fa9 -- package-lock.json`
- `git show --remerge-diff --format= b98ea4fa9 -- server/utils/user/UserFactory.ts`

`package-lock.json` (`--cc` against both parents): four combined hunks (`@@@ -42,14 -34,21 +34,22 @@@`, `@@@ -2355,178 -2478,19 +2479,70 @@@`, `@@@ -3701,23 -3793,6 +3845,13 @@@`, `@@@ -8025,28 -8103,18 +8169,29 @@@`); against `main` the lock adds 77 lines and deletes none, the added package entries being `@ts-morph/common` (with its nested `balanced-match`, `brace-expansion` and `minimatch`), `code-block-writer`, `path-browserify` and `ts-morph`, and the root `"ts-morph": "28.0.0"` devDependency line.

`server/utils/user/UserFactory.ts` (`--remerge-diff`, which `--cc` omits because that hunk equals the branch's side):

```diff
@@ -1,3 +1,4 @@
+import type { User } from './User';
 import { AnonymousUser, AuthenticatedUser } from './User';
 import { logger } from '../../logger';
 import { v4 as uuid, validate as isUuid } from 'uuid';
```

`git show --cc --format=` of the ten non-lock files (the `package-lock.json` block, the first 307 lines of the full `--cc` output, is summarized above). `package.json` and `DynamicOngoingEffectImpl.ts` appear in `--cc` because both sides touched nearby lines; they merged without a conflict or hand edit.

```diff
diff --cc package.json
index 2f92a8359,8761eb00e..e990e291c
--- a/package.json
+++ b/package.json
@@@ -35,12 -31,9 +35,13 @@@
      "lint-fix": "eslint --quiet --fix",
      "lint-verbose": "eslint",
      "get-cards": "node ./scripts/fetchdata.js",
+     "check-card-data": "node ./scripts/checkCardData.js",
      "validate-cards": "ts-node scripts/validateCards.ts",
 -    "validate-specs": "ts-node scripts/validateSpecs.ts"
 +    "validate-specs": "ts-node scripts/validateSpecs.ts",
 +    "generate-serializers": "node scripts/generate-state-serializers.js",
 +    "benchmark": "node scripts/run-performance-benchmarks.js",
 +    "benchmark-card-memory": "cross-env NODE_ENV=test node --expose-gc scripts/card-memory-benchmark.js",
 +    "measure-degradation": "node scripts/measure-save-degradation.js"
    },
    "dependencies": {
      "@aws-sdk/client-dynamodb": "^3.758.0",
@@@ -80,13 -65,20 +73,21 @@@
      "concurrently": "^9.1.0",
      "cpy-cli": "^5.0.0",
      "cross-env": "^10.0.0",
+     "eslint": "^9.8.0",
      "eslint-import-resolver-typescript": "^3.7.0",
      "eslint-plugin-import-x": "^4.6.1",
+     "eslint-plugin-jasmine": "^4.2.0",
      "eslint-plugin-unused-imports": "^4.1.4",
+     "glob": "^14.0.3",
+     "globals": "^15.9.0",
+     "jasmine": "^5.1.0",
+     "mkdirp": "^3.0.1",
      "socket.io-client": "^4.8.4",
      "supertest": "^7.3.0",
 +    "ts-morph": "28.0.0",
      "ts-node": "^10.9.2",
-     "ts-to-zod": "^3.15.0"
+     "ts-to-zod": "^5.1.0",
+     "typescript": "^5.5.4",
+     "typescript-eslint": "^8.0.1"
    }
  }
diff --cc server/game/core/ability/AbilityLimit.ts
index 7af25b45e,edc043db0..62b154894
--- a/server/game/core/ability/AbilityLimit.ts
+++ b/server/game/core/ability/AbilityLimit.ts
@@@ -68,7 -72,7 +68,7 @@@ export abstract class AbilityLimit exte
  
  @registerState()
  export class UnlimitedAbilityLimit extends AbilityLimit {
-     @stateMap() private accessor useCount: Map<string, number> = new Map();
 -    @stateValue() private accessor useCount = new Map<string, number>();
++    @stateMap() private accessor useCount = new Map<string, number>();
  
      public clone() {
          return new UnlimitedAbilityLimit(this.game);
@@@ -141,7 -145,7 +141,7 @@@ export class PerGameAbilityLimit extend
  export abstract class PerPlayerPerGameAbilityLimitBase extends AbilityLimit {
      public readonly max: number;
  
-     @stateMap() private accessor useCount: Map<string, number> = new Map();
 -    @stateValue() private accessor useCount = new Map<string, number>();
++    @stateMap() private accessor useCount = new Map<string, number>();
  
      public constructor(game: Game, max: number) {
          super(game);
diff --cc server/game/core/gameSteps/ActionWindow.ts
index 213732a88,82e9fc7f9..ca99383b1
--- a/server/game/core/gameSteps/ActionWindow.ts
+++ b/server/game/core/gameSteps/ActionWindow.ts
@@@ -180,24 -174,22 +190,26 @@@ export class ActionWindow extends UiPro
          if (this.game.manualMode) {
              buttons.unshift({ text: 'Manual Action', arg: 'manual', disabled: mustTakeCardAction });
          }
-         return {
-             menuTitle: overrideActionPromptTitle ?? 'Choose an action',
-             buttons: buttons,
-             promptTitle: ActionWindow.title,
-             promptUuid: this.uuid,
-             promptType: PromptType.ActionWindow
-         };
+         return buttons;
+     }
+ 
+     /** A menu command is only accepted if the matching button is currently offered to the player and enabled */
 -    private isMenuCommandAvailable(choice: string): boolean {
++    private isMenuCommandAvailable(choice: PromptButtonArg): boolean {
+         const { mustTakeCardAction } = this.getSelectableCards();
+         return this.getActionButtons(mustTakeCardAction).some((button) => button.arg === choice && !button.disabled);
      }
  
      public override waitingPrompt() {
          return { menuTitle: 'Waiting for opponent to take an action or pass' };
      }
  
 -    public override menuCommand(player: Player, choice: string, uuid: string) {
 +    public override isPlayerDecisionPrompt(): boolean {
 +        return true;
 +    }
 +
 +    public override menuCommand(player: Player, choice: PromptButtonArg, uuid: string) {
+         Contract.assertTrue(this.isMenuCommandAvailable(choice), () => `Menu command '${choice}' is not available to player ${player.name} in the current action window`);
+ 
          switch (choice) {
              // case 'manual':
              //     this.game.promptForSelect(this.activePlayer, {
diff --cc server/game/core/ongoingEffect/effectImpl/CloneUnitEffect.ts
index 05acad306,a60e00b9f..c4251c679
--- a/server/game/core/ongoingEffect/effectImpl/CloneUnitEffect.ts
+++ b/server/game/core/ongoingEffect/effectImpl/CloneUnitEffect.ts
@@@ -11,10 -11,10 +11,10 @@@ import { registerState, stateMap } fro
  
  @registerState()
  export class CloneUnitEffect extends OngoingEffectValueWrapperBase<ICardWithStandardAbilitySetup<Card>> {
-     @stateMap() private accessor _preCloneActionAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
-     @stateMap() private accessor _preCloneTriggeredAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
-     @stateMap() private accessor _preCloneConstantAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
-     @stateMap() private accessor _preClonePreEnterPlayAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
 -    @stateValue() private accessor _preCloneActionAbilityUuidsByTargetCard = new Map<string, string[]>();
 -    @stateValue() private accessor _preCloneTriggeredAbilityUuidsByTargetCard = new Map<string, string[]>();
 -    @stateValue() private accessor _preCloneConstantAbilityUuidsByTargetCard = new Map<string, string[]>();
 -    @stateValue() private accessor _preClonePreEnterPlayAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _preCloneActionAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _preCloneTriggeredAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _preCloneConstantAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _preClonePreEnterPlayAbilityUuidsByTargetCard = new Map<string, string[]>();
  
      public constructor(game: Game, clonedUnit: Card) {
          // If we are cloning a unit that is itself a clone, we need to find the original unit
diff --cc server/game/core/ongoingEffect/effectImpl/CopyStandardTriggeredAbilitiesEffect.ts
index f102ab30e,014e44090..b22c4618d
--- a/server/game/core/ongoingEffect/effectImpl/CopyStandardTriggeredAbilitiesEffect.ts
+++ b/server/game/core/ongoingEffect/effectImpl/CopyStandardTriggeredAbilitiesEffect.ts
@@@ -28,7 -28,7 +28,7 @@@ const abilityTypeDisplayName: Record<St
  
  @registerState()
  export class CopyStandardTriggeredAbilitiesEffect extends OngoingEffectValueWrapperBase<ICardWithStandardAbilitySetup<Card>[]> {
-     @stateMap() private accessor _preCopyTriggeredAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
 -    @stateValue() private accessor _preCopyTriggeredAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _preCopyTriggeredAbilityUuidsByTargetCard = new Map<string, string[]>();
      private readonly abilityType: StandardTriggeredAbilityType;
  
      public constructor(game: Game, sourceUnits: Card | Card[], abilityType: StandardTriggeredAbilityType) {
diff --cc server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl.ts
index 28823134c,edc227023..2f26678d6
--- a/server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl.ts
+++ b/server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl.ts
@@@ -15,10 -13,9 +15,10 @@@ export type WrapOngoingEffectValue<TVal
  @registerState()
  export default class DynamicOngoingEffectImpl<TValue> extends StaticOngoingEffectImplBase<TValue> {
      private readonly calculate: CalculateOngoingEffectValueWrapper<TValue>;
 +    private readonly wrapValue?: WrapOngoingEffectValue<TValue>;
  
      @stateRefMap()
-     private accessor values: Map<string, OngoingEffectValueWrapperBase<TValue>> = new Map();
+     private accessor values = new Map<string, OngoingEffectValueWrapperBase<TValue>>();
  
      public constructor(game: Game,
          type: EffectName,
diff --cc server/game/core/ongoingEffect/effectImpl/GainAbility.ts
index 259f3d988,49f17a246..308d3656e
--- a/server/game/core/ongoingEffect/effectImpl/GainAbility.ts
+++ b/server/game/core/ongoingEffect/effectImpl/GainAbility.ts
@@@ -16,8 -24,8 +16,8 @@@ export class GainAbility extends Ongoin
  
      @stateRef() private accessor _gainAbilitySource: Card | null = null;
      @stateRef() private accessor _source: Card | null = null;
-     @statePrimitive() private accessor _abilityIdentifier: string = '';
-     @stateMap() private accessor _abilityUuidByTargetCard: Map<string, string> = new Map();
+     @statePrimitive() private accessor _abilityIdentifier = '';
 -    @stateValue() private accessor _abilityUuidByTargetCard = new Map<string, string>();
++    @stateMap() private accessor _abilityUuidByTargetCard = new Map<string, string>();
  
      public get gainAbilitySource() {
          return this._gainAbilitySource;
diff --cc server/game/core/ongoingEffect/effectImpl/GainNonKeywordAbilitiesFromUnitEffect.ts
index fed6e4936,57210e712..c9ec89efd
--- a/server/game/core/ongoingEffect/effectImpl/GainNonKeywordAbilitiesFromUnitEffect.ts
+++ b/server/game/core/ongoingEffect/effectImpl/GainNonKeywordAbilitiesFromUnitEffect.ts
@@@ -15,9 -15,9 +15,9 @@@ import type { InPlayCard } from '../../
   */
  @registerState()
  export class GainNonKeywordAbilitiesFromUnitEffect extends OngoingEffectValueWrapperBase<IUnitCard> {
-     @stateMap() private accessor _triggeredAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
-     @stateMap() private accessor _actionAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
-     @stateMap() private accessor _constantAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
 -    @stateValue() private accessor _triggeredAbilityUuidsByTargetCard = new Map<string, string[]>();
 -    @stateValue() private accessor _actionAbilityUuidsByTargetCard = new Map<string, string[]>();
 -    @stateValue() private accessor _constantAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _triggeredAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _actionAbilityUuidsByTargetCard = new Map<string, string[]>();
++    @stateMap() private accessor _constantAbilityUuidsByTargetCard = new Map<string, string[]>();
  
      private get sourceUnit(): IUnitCard {
          return this.getValue();
diff --cc server/gamenode/GameServer.ts
index 08b16c46b,ce84703b4..ffbb88c5d
--- a/server/gamenode/GameServer.ts
+++ b/server/gamenode/GameServer.ts
@@@ -70,10 -70,15 +70,18 @@@ import { SwuBaseHandler } from '../util
  import { RefreshTokenSource } from '../utils/statHandlers/StatHandlerTypes';
  import { ModActionService } from '../utils/ModActionService';
  import { ModActionSubmissionHandler } from '../utils/ModActionSubmissionHandler';
- import { ModActionSubmitSchema, ModActionCancelSchema, FindUserSchema, ServerSettingsUpdateSchema } from '../services/DynamoDBInterfaceSchemas';
+ import {
+     CosmeticCreateRequestSchema,
+     DeckNameSchema,
+     FindUserSchema,
+     ModActionCancelSchema,
+     ModActionSubmitSchema,
+     SaveDeckRequestSchema,
+     ServerSettingsUpdateSchema
+ } from '../services/DynamoDBInterfaceSchemas';
 +import { MatchLoadError } from '../game/core/stateSerialization/MatchLoadError';
 +import type { IEngineOnlyFact, ISavedMatch } from '../game/core/stateSerialization/SavedMatchInterfaces';
 +import { getUserWithDefaultsSet } from '../Settings';
  import type { IScheduledTask, IScheduler } from '../utils/IScheduler';
  import { minimumSchedulerDelayMs } from '../utils/IScheduler';
  import { RealScheduler } from '../utils/RealScheduler';
diff --cc test/server/gamenode/auth/authorization/RouteAuthManifest.ts
index 0dbe391fc,92149e48e..261aad0c7
--- a/test/server/gamenode/auth/authorization/RouteAuthManifest.ts
+++ b/test/server/gamenode/auth/authorization/RouteAuthManifest.ts
@@@ -7,14 -7,18 +7,18 @@@ import type { RouteMethod } from '../..
   * - `anonymous-ok`: `authMiddleware` identifies the caller (an anonymous one gets a throwaway identity) and
   *   the handler serves anonymous and signed-in callers alike.
   * - `signed-in`: `authMiddleware`, and the handler refuses an anonymous caller.
+  * - `session-token`: no middleware; the handler reads the session token itself, to make or find the account
+  *   that identity has. Refuses a request with no session, and serves one that has a session whether or not
+  *   its account exists yet.
 - * - `moderator` / `admin`: `authMiddleware` refuses a caller who lacks the role. An admin passes every
 + * - `developer` / `moderator` / `admin`: `authMiddleware` refuses a caller who lacks the role. An admin passes every
   *   role check; a moderator does not pass an admin one.
-  * - `shared-secret`: no middleware; the handler compares a key the FE server puts in the body with
-  *   `INTRASERVICE_SECRET`.
+  * - `shared-secret`: the handler compares a key the FE server puts in the body with `INTRASERVICE_SECRET`.
+  *   Where the route acts on a user's account it also sits behind `authMiddleware`, for the session the FE
+  *   server forwards.
   * - `api-key`: no middleware; the handler compares an `Authorization: api-key <key>` header with
   *   `PROFILE_CAPTURE_SECRET`.
   */
- export type RouteAccess = 'public' | 'anonymous-ok' | 'signed-in' | 'developer' | 'moderator' | 'admin' | 'shared-secret' | 'api-key';
 -export type RouteAccess = 'public' | 'anonymous-ok' | 'signed-in' | 'session-token' | 'moderator' | 'admin' | 'shared-secret' | 'api-key';
++export type RouteAccess = 'public' | 'anonymous-ok' | 'signed-in' | 'session-token' | 'developer' | 'moderator' | 'admin' | 'shared-secret' | 'api-key';
  
  export interface IRouteAuthRow {
      method: RouteMethod;
```
