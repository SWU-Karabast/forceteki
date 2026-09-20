# Implementation Order

The plans in this directory are **design docs**, not implementation handoffs. This
file is the bridge: it breaks each plan into **units** — one unit = one
`/orchestrate` run (full lane or `--fast` lane) = one staged diff = one commit gate.

This is a **backlog, not a set of plans**. No unit is planned in advance. Each
unit gets its handoff written by the Anvil plan stage immediately before it is
implemented, so the plan is always written against current `main` rather than
against `7a0526549` (the commit every line reference in the plan docs is anchored
to). That freshness is the whole reason for planning just-in-time.

**Plans 4–6 were decomposed on 2026-09-20**, after Plan 3 completed, against the tree at `56e2579ab`. Their unit tables follow Plan 3's, preceded by the re-anchoring survey that records how far the `7a0526549`-anchored plan docs have drifted.

---

## Conventions

### Routing

| Unit shape | Command |
|---|---|
| Small, tightly specified, no design decision left open | `/orchestrate --fast` (the Anvil fast lane; there is no separate `mini` command) |
| Anything Medium+, or anything with an open decision, or 🔴 | `/orchestrate` |
| The three units named under "Tier overrides" | `/orchestrate --tier N` |

The fast lane escalates to the full lane on its own if the direct agent finds
the unit exceeds a bounded scope. Trust that valve — do not grind a unit
through fast.

Sizes and risk markers below use the Anvil classification vocabulary
(`Small|Medium|Large`, `🟢|🟡|🔴`) so they line up with the pipeline's own
model routing. They are **estimates for scheduling**, not instructions to the
plan agent — the plan stage classifies the unit itself, and its classification
wins. The pipeline resolves models and effort from the resulting tier
(Sonnet for tiers 1–2, Opus planning and review from tier 3, Opus
implementation at tier 4); do not pin a model in the invocation text.

### Tier overrides

Ten units carry an explicit `--tier` because the default classification is
likely to under-tier them:

| Unit | Flag | Why |
|---|---|---|
| `P3-PB2` | `--tier 4` | The highest-risk unit in Plans 1–3; Opus implementation and Opus on every critical lens from the start, since the doc forbids raising the fix cap if it fails to converge. |
| `P1-B` | `--tier 3` | Changes rollback semantics (uuid reuse, registration guard); a single reviewer is too thin even if the plan agent calls it Medium. |
| `P2-C2` | `--tier 3` | Rebuilds the pipeline from a file; same reasoning. |
| `P4-E` | `--tier 3` | Delta chain composition, contiguity and eviction: the exact machinery that consumed one failed implementation round on the `-codex`/`-opus` prototypes. |
| `P4-F` | `--tier 4` | The delta cutover: changes what a rollback is, the hollow current snapshot, and the whole-suite gate in one atomic commit, with the same no-cap-raise rule as `P3-PB2`. |
| `P5A-2` | `--tier 3` | Deliberately loosens the registration guard `P1-B` shipped tight; a single reviewer is too thin for a unit whose job is to weaken a safety check. |
| `P5B-1` | `--tier 4` | The composite recreation protocol for cards: the largest constructor fan-out and the largest split-brain surface in the roadmap. |
| `P5C-2` | `--tier 3` | Replaces the monotonic `hasRef` latch with per-uuid liveness; a wrong release is a `SevereHaltGame` two rollbacks later. |
| `P6-C1` | `--tier 4` | Load-time identity mapping, the item Plan 6 itself names as its largest; rekeys every live object against a file through Plan 5's scope machinery in a new mode. |
| `P6-C2` | `--tier 3` | Constructs file-only records and rewrites every ref through the translation table; a missed rewrite is a dangling ref that only fails later. |

### Proof level

No `AGENTS.md` sets a proof level, so Anvil defaults to `standard`. Every 🔴
invocation below states `Proof level: hardened` explicitly, and the project
`CLAUDE.md` declares the same for roadmap units; `standard` is fine for the
🟢/🟡 units.

### Verification commands (the Forge)

Every unit gates on the same three commands, in this order, unless its
invocation says otherwise:

```bash
npm run lint
npm run test-parallel
npm run test-parallel-undo
```

The suite is ~2,000 spec files, so use the parallel forms for gating.
`npm run test-fast` is for inner-loop iteration only. The stale-artifact hazard
Plan 3 warned about here did not survive `P3-PA1` (`75665d015`): the generation
step is placed unconditionally, before the `--fast-build` branch in
`scripts/build-test.js`, so a repeat fast build still regenerates a stale
artifact rather than compiling it. Verified by two consecutive `--fast-build`
runs. `test-fast` remains unsuitable as gating evidence for the ordinary reason —
it skips part of the build — not because of codegen. Only the ⏱ units run the
benchmark.

### Task IDs, state, and the audit trail

This roadmap is 52 orchestrate runs: 18 landed for Plans 1–3, the deferred `P3-PB4`, and 33 for Plans 4–6 (9 for Plan 4, two of them conditional on the `P4-D` verdict; 16 for Plan 5; 8 for Plan 6).
Use the unit ID from the tables below, lowercased, as the `task_id`: `p1-a`,
`p2-a2`, `p3-pa2`, `p4-f`, `p5a-2`, `p5b-1`, `p5c-2`, `p6-c1`. That keeps `resume` disambiguation legible when several
runs are in flight or abandoned.

Run state lives in `.anvil/{task_id}/`, which Anvil adds to the git-local
exclude — it is **not** committed, and durable outputs must not cite it. The
durable record is the Anvil project log; tell the first run to place it at
`docs/plans/ANVIL-LOG.md` (the default location is `Docs/Anvil-Log.md`,
which does not match this repo's lowercase `docs/`) and every later run
appends to it. Commit on `experimental/rollback-saves-optimizations` rather
than Anvil's fallback `anvil/{task_id}` branch, and start each unit in a
fresh session so the orchestrator's context holds exactly one handoff.

### Scope fences (the important one)

Each plan reads as one coherent document. Handing the plan agent a file path and
a work-item letter is **not** enough — it will pull in adjacent sections, because
they are written to be read together. Every invocation below therefore carries an
explicit fence: what is in scope, what has already landed, what to leave alone.

Use the invocation blocks verbatim. If you edit one, keep the fence.

### Performance captures are per-plan, not per-unit

Each plan doc ends with a "Performance capture (required on completion)" section.
An agent reading a single work item in isolation will see it and try to run it.
**Only the final unit of each plan owns the capture**, marked ⏱ below; every
other invocation explicitly forbids it.

| Plan | Capture owned by | Command |
|---|---|---|
| 1 | `P1-B` | `npm run benchmark -- --name after-plan-01 --compare initial-performance` |
| 2 | `P2-E` | `npm run benchmark -- --name after-plan-02 --compare initial-performance` |
| 3 | `P3-PB3` | `npm run benchmark -- --name after-plan-03 --compare pre-roadmap-baseline` |
| 4 (decision-gate evidence, not the plan capture) | `P4-D` | `npm run benchmark -- --name after-plan-04-memo --compare after-plan-03` |
| 4 | `P4-G` | `npm run benchmark -- --name after-plan-04 --compare pre-roadmap-baseline` (also compare `after-plan-03`; this is the roadmap's performance verdict) |
| 5a | `P5A-6` | `npm run benchmark -- --name after-plan-05a --compare pre-roadmap-baseline` |
| 5b | `P5B-6` | `npm run benchmark -- --name after-plan-05b --compare pre-roadmap-baseline` |
| 5c | `P5C-4` | `npm run benchmark -- --name after-plan-05c --compare pre-roadmap-baseline` |
| 6 | `P6-F` | `npm run benchmark -- --name final-performance --compare pre-roadmap-baseline` (also compare `after-plan-05c`) |

Plan 5 captures per stage because its doc requires it and each stage is separately landable; each of those three captures is still owned by exactly one unit. `P4-D`'s interim capture is the one sanctioned exception to "only the ⏱ unit runs the benchmark": it exists to decide whether the delta stage runs at all, and it is named `after-plan-04-memo` so it can never be mistaken for the plan's capture.

Two standing rules from [Plan 0](00-performance-benchmarks.md) that are easy to
break by accident, repeated here because they bind every unit: **do not edit an
existing benchmark scenario**, and **do not redefine a headline benchmark**
(`manager/*`, `payload/*`, `sustained/*`) without saying so in the plan doc.

---

## Plan 0 — Performance benchmarks ✅ Complete

Landed in `26c1a839`. `docs/plans/performance/initial-performance.{md,json}` is
the baseline every later capture compares against. No units.

---

## Plan 1 — Snapshot Hygiene & Enablers

Four units. `P1-E` and `P1-C` are independent of everything; `P1-B` hard-depends
on `P1-A` **in full**.

| Unit | Scope | Depends on | Size | Route | Status |
|---|---|---|---|---|---|
| `P1-E` | Item E — housekeeping / dead-code deletion | — | Small 🟢 | `--fast` | landed `512a62113` |
| `P1-C` | Item C — seed the RNG in production, surface the seed | — | Small 🟡 | `--fast` | landed `d5afa3de8` |
| `P1-A` | Item A — `OngoingEffectValueWrapper` churn + `refreshContext` caching | — | Medium 🔴 | full | landed `aa95babf7` |
| `P1-B` ⏱ | Item B — restore `lastGameObjectId`, `_isRollingBack` guard, client-protocol audit | `P1-A` | Medium 🔴 | `--tier 3` | landed `5787a3314` |

**Plan 1 is complete.** All four scheduled units have landed and the closing
performance capture (`after-plan-01`) is committed. Note for later plans:
item B's acceptance criterion (a) — replayed objects receive the *same* uuids —
is **not** met; the counter no longer drifts and replayed ids are bounded within
the freed window, but exact uuid reproducibility does not hold. See the `P1-B`
entry in [ANVIL-LOG.md](ANVIL-LOG.md).

Item D is **not scheduled** — it is a prerequisite contract for a future
client-facing bookmarks feature. Do not create a unit for it.

**Run `P1-E` first.** It is the smallest real change in the roadmap and doubles as
a shakedown of the pipeline itself — you find out whether the Forge verification
and the commit gate behave on this repo before betting a 🔴 unit on it.

### `P1-E` — Housekeeping

```bash
/orchestrate --fast Implement docs/plans/01-snapshot-hygiene.md work item E (Housekeeping) ONLY. This is the first roadmap run: create the Anvil project log at docs/plans/ANVIL-LOG.md and commit on the current branch (experimental/rollback-saves-optimizations), not on an anvil/ branch. In scope: delete SnapshotArray + SnapshotFactory.createSnapshotArray; delete dead GameObjectBase.getState(); fix test/helpers/IntegrationHelper.js:78 (UndoMode.Full -> UndoMode.Free); surgically remove never-called UndoLimit.reset()/isPerGameLimit() while keeping incrementUses and hasReachedLimit. Scope fence: do NOT touch work items A, B, C, or D. Do NOT delete any git branches in this run - branch deletion is a manual step for the repo owner. Do NOT run the performance capture; that belongs to unit P1-B. task_id: p1-e
```

Item E's branch-deletion bullet is carved out on purpose: deleting local branches
is irreversible and the plan itself says to verify supersession by diff first.
Do that by hand.

### `P1-C` — RNG seeding

```bash
/orchestrate --fast Implement docs/plans/01-snapshot-hygiene.md work item C (Seed the RNG in production and surface the seed) ONLY. Scope fence: do NOT touch work items A, B, D, or E. Treat the "seed is a server-side secret" constraint as a hard requirement, not a nice-to-have: the seed must never reach any client-bound payload, and a Bo3 lobby must mint a fresh seed per Game instance. Include the test or check that asserts the seed's absence from client-bound game/lobby state. Do NOT run the performance capture; that belongs to unit P1-B. task_id: p1-c
```

### `P1-A` — Ongoing-effect wrapper churn

The largest unit in Plan 1 and the one with a **live design decision**: option 1
(reuse wrappers, value as decorated state) vs option 2 (demote the value to plain
state on the impl). The plan prefers option 1 because **Plan 5 stage 5b builds its
`OngoingEffectValueWrapper` recreation recipe on exactly the JSON-safe decorated-value
subset option 1 establishes.** Choosing option 2 forces Plan 5 to redo that state
modeling. Surface that choice at the plan gate — do not let it be settled inside
the implement stage.

```bash
/orchestrate Implement docs/plans/01-snapshot-hygiene.md work item A (Eliminate OngoingEffectValueWrapper churn) ONLY, including the "Related fix in the same area" (per-OngoingEffect context caching). Scope fence: do NOT touch work items B, C, D, or E. Two things must be settled at the plan gate rather than during implementation: (1) option 1 vs option 2 from the plan's Direction section - the plan prefers option 1 because Plan 5 stage 5b depends on the decorated-value subset it establishes, so a choice of option 2 must be justified explicitly and flagged as a Plan 5 impact; note that OngoingEffectEngine.summarizeOngoingEffectsForState (the client-state ongoing-effect summary) now reads impl.valueWrapper.targetStates on every state serialization, which is a new dependency on wrapper object identity that option 2 would have to preserve; (2) the aliasing audit the plan calls for - with in-place context mutation, every retainer of OngoingEffect.context / impl.context observes post-rollback values retroactively, and the plan requires that audit before landing; the summary code above also reads effect.context and effect.ongoingEffect per serialization and belongs in that audit. Respect the plan's out-of-scope list: retention semantics for GainAbility, AdditionalPhaseEffect, GainKeyword and for function- or GameObject-bearing values are unchanged. Gate on the full suite plus ENABLE_UNDO_ALL_TESTS=true (npm run test-parallel && npm run test-parallel-undo), not the default suite. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P1-B. task_id: p1-a
```

### `P1-B` ⏱ — `lastGameObjectId` restore

Blocked on `P1-A` landing **in full**. Landing this after only the context fix
makes the unconditional `_isRollingBack` guard crash every rollback in any game
with a live dynamic ongoing effect.

```bash
/orchestrate --tier 3 Implement docs/plans/01-snapshot-hygiene.md work item B (Restore lastGameObjectId on rollback) ONLY. Proof level: hardened. Work item A has already landed in full (both the transient-churn fix and the context fix) - verify that before planning, because this item's zero-registration contract is unreachable otherwise. Scope fence: do NOT touch work items A, C, D, or E. In scope: restore _lastGameObjectId at the end of rollback including the error-recovery path; activate the _isRollingBack guard so register() hard-fails during rollback, implemented nesting-safe via a depth counter because rollbackToSnapshot re-enters itself on the recovery path; add the gameObjectMapping occupancy assert in register(); the uuid-reuse audit against non-state-tracked structures only. The guard lands UNCONDITIONAL here - Plan 5's rehydration-scope carve-out arrives with Plan 5, not now. The client-protocol audit is a required deliverable, not optional: uuids are the client's card identifiers, and with reuse a stale inbound message can silently bind to a different card, so this needs either action-sequence guards on inbound messages around rollback or a demonstration that inbound messages are drained/invalidated before rollback completes. The audit must cover every uuid-bearing client payload, not just Card.getSummary / cardClicked: the ongoing-effect summary in game state (OngoingEffectEngine.summarizeOngoingEffectsForState emits sourceCardUuid and target uuids per active effect) is a second one. This is the FINAL unit of Plan 1: after the diff is green, run `npm run benchmark -- --name after-plan-01 --compare initial-performance` and commit both generated files under docs/plans/performance/. task_id: p1-b
```

---

## Plan 2 — Semantic Save/Load v1

Seven units. The plan estimates "4–5 PRs"; this splits finer, because
`/orchestrate` gates the whole unit behind one commit and converges review in
`IMPL_REVIEW_CAP = 2` rounds — a 5-file-subsystem diff is exactly the shape that
fails to converge. Two splits are load-bearing rather than cosmetic: `P2-B` lands
the invariant guardrail before anything is written against it, and `P2-C1` carves
the engine-side state-injection port out of the loader, because it is
independently valuable and independently testable.

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P2-B` | Item B — JSON-safety dev assertion in the decorator layer | — | Small 🟢 | `--fast` |
| `P2-A` | Item A — `ISavedMatch` schema, writer, `engineOnlyFacts` manifest | `P2-B` | Large 🟡 | full |
| `P2-A2` | Item A2 — per-watcher semantic entry encoding | `P2-A` | Large 🔴 | full |
| `P2-C1` | Item C.3/C.4 — headless prompt driver + engine-side state injection | `P2-A` | Large 🟡 | full |
| `P2-C2` | Item C — `MatchLoader` proper: validation, seat binding, restore order, pipeline re-entry | `P2-A2`, `P2-C1` | Large 🔴 | `--tier 3` |
| `P2-D` | Item D — save request surface + the armed one-shot trigger | `P2-C2` | Medium 🟡 | full |
| `P2-E` ⏱ | Item E — round-trip, continuation, degraded-manifest, trigger tests + degradation-rate measurement | `P2-D` | Medium 🟡 | full |

**Plan 2 is complete.** All seven units have landed and the closing capture
([`after-plan-02`](performance/after-plan-02.md)) is committed. Two things the
closing unit surfaced are worth carrying forward rather than leaving buried in
[the Anvil log](ANVIL-LOG.md#p2-e--verification-suite--degradation-measurement-plan-2-work-item-e):

- **The writer refused outright on roughly 0.9% of real boards** (`SaveIntegrityError`
  from its own completeness check — a card owned and in a zone that never got
  indexed), across several card shapes. A `P2-A` defect, found by `P2-E`'s
  measurement and **since fixed** — see finding `P2E-I1-01` in
  [the Anvil log](ANVIL-LOG.md#p2-e--verification-suite--degradation-measurement-plan-2-work-item-e).
  The completeness check now reports zero hard failures; the only refusals left
  are the `Card.nextAbilityIdx` coordinate-drift ones the design intends.
- **9.9% of boards save degraded**, dominated by `lastingEffect` and
  `delayedEffect` — the categories Plan 6 is meant to close.

**Land `P2-B` first, before the writer.** It is the standing-invariant
enforcement, and it will likely surface existing `@stateValue` payloads that
violate it. Finding those while fixing a 30-line guardrail is much cheaper than
finding them inside the writer unit.

### `P2-B` — JSON-safety dev assertion

```bash
/orchestrate --fast Implement docs/plans/02-semantic-save-load.md work item B (JSON-safety dev assertion) ONLY. Add a dev-mode check in the decorator layer that @stateValue values must be JSON-representable or a known encodable type (Map/Set with JSON-safe elements, GameObjectId), modelled on the existing StateWatcher dev check at StateWatcher.ts:105-110. Note the distinction the plan draws: GameObjectIds are legal in engine state - invariant 2 bans them only from save FILES, which is work item A2's problem, not this one. Known coverage gap, to be stated in the check's docs rather than closed here: StateWatcher entries are written straight into the state bag (no @stateValue accessor) until Plan 3 Phase A step 0 migrates them, so this assertion does not see watcher payloads (including their Set<Trait> members) - Plan 3's step 2 encoder is deliberately the first enforcement for those. Scope fence: do NOT touch work items A, A2, C, D, or E; do not write any save-format code. Expect this to surface existing violating payloads - fix them or report them, do not weaken the check to accommodate them. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-b
```

### `P2-A` — Schema + writer + manifest

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item A (Schema + writer) ONLY, including the full "Schema (v1)" section that defines ISavedMatch. The base entry carries `upgrades` and `capturedCards` arrays exactly like an arena entry does: BaseCard has a @stateRef capture zone (Detention Block Rescue and Libertine capture to base) and a @stateRefArray upgrades list (Fortify), so a base-only `{ card, damage, limits }` shape cannot represent a real position. Scope fence: do NOT implement work item A2 (state-watcher entry encoding) - leave the stateWatchers section of the schema defined but written as empty/unpopulated with a clearly marked TODO for A2; do NOT touch work items C, D, or E. Work item B (the JSON-safety dev assertion) has already landed. Two rules the plan is emphatic about and that must survive review: (1) do NOT reuse Game.captureGameState - it deliberately truncates (top-5 deck cards, no limits/effects) and this writer must be lossless for the schema's scope; (2) the degrade-with-manifest rule is WRITE-SIDE ONLY - unrepresentable game state degrades with an enumerated engineOnlyFacts entry, but Card.nextAbilityIdx coordinate drift still HARD-FAILS at write time, because a save whose coordinates cannot be trusted is corrupt rather than degraded. Implement the nextAbilityIdx detection procedure the plan specifies (re-derive the identifier set from a pristine instance of the card class, hard-fail if the identifier about to be emitted is absent). The engineOnlyFacts schema is inherited by Plan 6 - treat its shape as a published contract. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-a
```

### `P2-A2` — State-watcher entry encoding

The hardest unit in Plan 2. It carries the negative-range counter-minting
decision, which exists to prevent a rewritten `activeAttackId` from colliding with
a *future* live attack id and making Flash the Vents count stale pre-save damage.

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item A2 (State-watcher entry encoding) ONLY. Work item A has landed; the schema's stateWatchers section currently exists but is unpopulated - this unit fills it. Scope fence: do NOT touch work items C, D, or E. Required deliverables, all three: (1) the shared ISavedCardRef encoding, whose zone domain is WIDER than the array zones - it must include the singleton positions leader and base with ordinal 0, and a sub-position form for cards nested in an arena entry's OR the base entry's upgrades/capturedCards arrays, or saves degrade spuriously after any leader deploy or base heal; (2) a per-watcher field inventory covering EVERY non-GameObjectId field of every entry struct in server/game/stateWatchers/, each explicitly classified as semantic data, stint flag, order-only counter, or live-comparison counter - the plan's list of examples is an example, not the inventory, and the inventory must be produced before any serializer is written; (3) the serializers themselves. Two decisions are already made and must not be re-litigated: live-comparison counters are minted by the loader from a NEGATIVE, order-preserving range (live generators only ever produce non-negative ids, so collision is impossible and no engine change is needed - the alternative of restoring lastGameEventId and bumping _lastAttackId was explicitly rejected); and the three Set<Trait> payloads (AttacksThisPhaseWatcher.attackerAttributes, plus the shared IStateWatcherLKIEntry stored by CardsDefeatedThisPhaseWatcher.lastKnownInformation and CardsLeftPlayThisPhaseWatcher.lastKnownInformation) are captured-at-event-time semantic data that must be SERIALIZED via tagged-Set encoding, not dropped. One stint-flag subtlety the inventory must resolve: CardsLeftPlayThisPhaseWatcher.getLeftPlayEntry matches a saved inPlayId against InPlayCard.mostRecentInPlayId (a @statePrimitive) for cards that have LEFT play, so the sentinel the loader writes for a non-current stint must equal whatever mostRecentInPlayId the loaded card ends up with (injected discard cards never entered play, so it is -1 unless the loader sets it) - define the pair together, or the entry silently never matches post-load. Unresolvable referents drop the entry and append a watcherEntry manifest entry - enumerated, never silent. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-a2
```

### `P2-C1` — Headless prompt driver + engine-side state injection

Carved out of item C deliberately. This is the "large incidental win" the plan
names — state injection stops being test-only code and becomes a supported engine
feature, with the test helpers reduced to thin wrappers. It is worth landing and
reviewing on its own terms, and it de-risks `P2-C2` substantially.

```bash
/orchestrate Implement ONLY the engine-side-port half of docs/plans/02-semantic-save-load.md work item C - specifically C step 3's headless prompt driver and C step 4's state-injection port. Scope fence: do NOT build MatchLoader itself, do NOT implement C steps 1, 2, 5, or 6, and do NOT touch work items D or E. In scope: (a) port GameFlowWrapper's setup-driving logic (selectInitiativePlayer, keepStartingHand, resourceAnyTwo) into engine code as a scripted setup runner that answers prompts by prompt TYPE, never by title-string matching; (b) port the PlayerInteractionWrapper / GameStateBuilder injection operations into engine-side code (moveAllNonBaseZonesToRemoved, setGroundArenaUnits, setHand, setDeck, setLeaderStatus, setBaseStatus including its upgrades and capturedUnits options, setResourceCards, setDiscard, setHasTheForce, setCreditTokenCount, upgrade/capture attachment, damage/exhaust state, explicit outsideTheGame placement), plus one operation the helpers lack: setting a non-in-play card's InPlayCard.mostRecentInPlayId, which the loader needs so watcher stint flags resolve for cards in discard (see P2-A2); (c) refactor the test helpers into thin wrappers over the new engine implementation, with the existing suite green as the proof. Two mandatory deviations from the helpers, both from the plan: the engine-side setLeaderStatus must NOT do implicit deploy-limit bookkeeping (the helper increments it by title-string matching on '.includes("Deploy")' - use isEpicActionLimit() for identification and leave ALL limit counts to the loader's restore pass); and the injection path must expose a post-injection assertion that the outsideTheGame staging zone contains exactly what was intended, since moveAllNonBaseZonesToRemoved stages every card there and any card the caller failed to place would silently remain. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-c1
```

### `P2-C2` — MatchLoader

```bash
/orchestrate --tier 3 Implement docs/plans/02-semantic-save-load.md work item C (Loader) ONLY, EXCLUDING the parts already landed by unit P2-C1. Proof level: hardened. Already landed and to be consumed, not rebuilt: the headless prompt driver (C step 3) and the engine-side state-injection operations (C step 4). Also already landed: work items A, A2, and B. Scope fence: do NOT touch work items D or E. In scope: MatchLoader.loadAsync - C steps 1, 2, 5, and 6. Specific requirements the plan pins: validate formatVersion but do NOT gate on cardDataVersion (that would brick every save on every card-data refresh); instead validate that every internalName, token name, and abilityIdentifier resolves against current card data, reporting saved-vs-current cardDataVersion as error diagnostics. Restore order is exactly as specified and is not a free choice: per-copy ability-limit counts (the single authority for ALL limits including epicDeployUsed), then watcher entries, chat, timers, RNG state, Game.state scalars, then the passedActionPhase derivation. Chat restore REPLACES the message log, never appends - the driven setup generates its own messages. Timer restore persists only main-timer remaining; isOnMainTimer is deliberately not persisted, and ByoyomiTimer needs a small public restore method added. Finish with resolveGameState(true), clearAllSnapshots(), then postRollbackOperations({ Round, WithinActionPhase }). The degrade-with-manifest rule NEVER applies on the load side: unknown coordinates, schema violations, corrupt or truncated files, and staging-zone residue all hard-fail loudly. A save with a non-empty engineOnlyFacts manifest loads normally and the loader surfaces the manifest to the caller. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-c2
```

### `P2-D` — Server plumbing + armed one-shot trigger

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item D (Server plumbing) ONLY. Work items A, A2, B, and C have landed. Scope fence: do NOT touch work item E. In scope: the save request surface; the armed one-shot save trigger; the dev-facing load flow that binds users to seats and surfaces the engineOnlyFacts manifest. The artifact is delivered SERVER-SIDE: the completed ISavedMatch is attached to the player's bug report through the existing formatAndSendReportAsync Discord path, and the client still receives only the success boolean - the file is never sent to the client. This is a hard requirement, not a convenience: the file contains rng.seed, and Plan 1 item C (already landed) asserts the seed is absent from every client-bound payload; a client download would fail that test. The armed one-shot is the substantive piece: a request arriving at an action-window boundary saves inline, otherwise the lobby stores { requestedAtActionNumber, requestedAtPhase } and arms a one-shot that the NEXT action-window boundary consumes - and this must work independently of undoMode, guarding the SnapshotManager early-returns at :116 and :134. The armed state is bound to the current game instance and cleared on game end, on phase exit to regroup, and on disconnect; a stale flag firing into a later round would produce an artifact that silently misrepresents the reported moment, which is the one failure mode this unit must not ship. A request that arrives OUTSIDE the action phase (during setup or regroup) is refused with a player-visible "save unavailable until the next action" response rather than armed - there is no same-round boundary for it to fire at, and arming it would cross a round boundary in contradiction of the declared one-action drift bound. Hidden information is DOCUMENTATION-ONLY for v1 by explicit decision - deck order and hands are in the file in cleartext because the recipient is the dev team and that is exactly what makes a report reproducible; document the constraint, do not build a scrubbing writer mode. The dev-facing load flow constructs a game and must respect the server-wide gamesEnabled maintenance setting (ServerSettingsCache) the same way game creation does. Server-side save storage beyond the Discord attachment is out of scope. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-d
```

### `P2-E` ⏱ — Verification

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item E (Verification) ONLY. Work items A, A2, B, C, and D have all landed. This unit is the cross-cutting test suite that only makes sense once the whole arc exists. Build all five groups the plan enumerates: (1) round-trip property tests with the two defined normalizations - savedAt excluded, and stateWatchers compared as maps keyed by watcher name with absent-equals-empty, because GameStateBuilder registers every watcher in the library while production games register only what their cards request; for a degraded first save the property is that the documents match after excluding engineOnlyFacts and savedAt AND the re-save's manifest is empty; (2) continuation tests for all eight required scenarios, which must pass for non-degraded saves only; (3) degraded-save manifest tests asserting each category enumerates exactly what was dropped and nothing else; (4) armed-one-shot trigger tests including the undo-disabled case, the stale-flag-clearing cases, and the refused-outside-action-phase case; (5) writer hard-refusal and load-side rejection tests. Also implement the degradation-rate measurement instrumented against the existing integration-test suite - this is for visibility and is explicitly NOT a ship gate. This is the FINAL unit of Plan 2: after the suite is green, run `npm run benchmark -- --name after-plan-02 --compare initial-performance` and commit both generated files under docs/plans/performance/. task_id: p2-e
```

---

## Plan 3 — Codegen State Serializers

Seven units plus one deferred. This is the plan the rest of the roadmap sits on:
Plans 4, 5, and 6 all consume its output, so a shortcut here is paid for three
times.

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P3-PA0` | Phase A step 0 — migrate `StateWatcher` off direct state-bag writes | — | Medium 🔴 | full |
| `P3-PA1` | Phase A steps 1–2 + step 6 registry policy + **step 10 lint fix** — generator, record format, schema-surface hash | `P3-PA0` | Large 🔴 | full |
| `P3-PA2` | Phase A step 3 — parity harness, serialize leg | `P3-PA1` | Medium 🟡 | full |
| `P3-PA3` | Phase A step 4 — parity harness, restore leg | `P3-PA2` | Medium 🔴 | full |
| `P3-PA4` | Phase A step 5 — coverage/staleness cross-check | `P3-PA1` | Medium 🟡 | full |
| `P3-PB1` | Phase B step 7 — `stateMap`/`stateSet`/`stateArray` decorator split | `P3-PA1` | Medium 🟡 | full |
| `P3-PB2` | Phase B steps 1–5 — **the cutover** | all of Phase A, `P3-PB1` | Large 🔴 | `--tier 4` |
| `P3-PB3` ⏱ | Phase B step 9 — docs + perf capture | `P3-PB2` | Small 🟢 | `--fast` |
| `P3-PB4` | Phase B step 8 — retire the parity harness | `P3-PB2` + one release cycle | Small 🟢 | *deferred* (`--fast`) |

**`P3-PA4` landed (`d218b8b56`) and Phase A is complete.** The coverage/staleness
cross-check compares runtime decorator metadata against the generated model per
class, by field name **and** kind, and hard-fails on any delta — at dev startup
and in a CI spec that force-loads every card module. It is proven falsifiable
through the real generator pipeline in both directions (a dropped field and a
dropped class, each regenerated, observed red, reverted), so it is a gate that
can actually go red rather than one that merely passes.

Three things `P3-PB2` should take from it. **Keep the decorator metadata
field-name recording** when slimming the decorators — this check depends on it,
as does the `stateSimpleKindMetadata` bucket the unit added. **Cite
`DeckZone=78`** as the exhaustive class-level breakdown: the `P3-PA3` follow-up
landed here, and all 78 masked pre-rollback forward violations are `DeckZone`,
so the "10 of 78" sample in that entry is superseded. And note that two premises
from this unit's own brief were **false and are corrected** in
[ANVIL-LOG.md](ANVIL-LOG.md): `validate-cards` force-loads nothing (it is static
text analysis; `cards/Index.ts`'s `require()` loop is the real mechanism), and
dev startup already loads every card class today, so the two-call-site design is
justified by CI enforcement rather than by the stated coverage gap.

Both `P3-PA3` follow-ups tracked here are now closed: the zoneClass tally is
exhaustive, and reporter run-directory pruning targets stale sibling directories
at module load. A third correction came out of it — `process.ppid` is **not** a
stable per-shell identifier in this environment (four invocations from one shell
gave four values); only P3-PA3's narrower shared-ppid-across-one-`--parallel`-run
claim holds.

**`P3-PA3` landed (`761d82d66`) and answered the cutover's zone question.** The
restore leg is green on both modes, and the finding `P3-PB2` was told to consume
is recorded in [ANVIL-LOG.md](ANVIL-LOG.md): **`reconcileUpdatedCardZoneMemberships`
is not needed on main's full-snapshot restore path.** Structurally it exists only
on `-morph`, called solely from `rollbackToDeltaChain`, and is absent from this
branch. Empirically, forward and reverse zone violations are both zero across
8,186 rollbacks in a single-process complete-coverage compare-mode run. Read the
log entry's four labels before relying on it — in particular that a parallel
`[ParityHarness] pid=` reporter line covers only about 75% of a run in undo mode
and an unbounded fraction in non-undo mode, which is why the complete-coverage
evidence is a serial run.

**`P3-PA2` landed (`02664636b`) and the generator passed its gate.** Across
78,602 snapshots and 10,895,600 records in the undo suite, the generated
serializers produced **zero comparison mismatches** against the existing
`getStateUnsafe()`+`v8` path. That is the empirical answer to the cutover's
central question, and `P3-PB2` should consume it rather than re-deriving it.

Two consequences for the units still ahead:

- **`P3-PA3`'s known blocker is cleared.** The harness surfaced one real latent
  defect: `DamageDealtThisPhaseWatcher.damageSourceCardTypes` holds `undefined`
  in a field typed `CardType[]` with non-optional elements, which
  `encodeStateValue` deliberately refuses and `v8.serialize` silently tolerated.
  All 84 parity failures were that single root cause, and `P3-PA2`'s `AC7`
  landed as accepted-risk against it. **The spun-out fix landed at `02b63ac53`
  (`P3-PA2F`), and both parity suites are now green**, so `AC7` is satisfied and
  that residual is discharged. `P3-PA3` exercises the same watcher state but
  should not re-diagnose this — the cause was that `event.damageSource.card` is
  not a card at all in the ability branch: a framework `AbilityContext` defaults
  its `source` to an `OngoingEffectSource`, which answers `getObjectId()` but
  has no `type`. See the `P3-PA2F` entry in
  [ANVIL-LOG.md](ANVIL-LOG.md) before planning; note that entry is a direct fix
  session, not an `/orchestrate` run, so it carries no review assurance.
- **`P3-PB3` must run its benchmark capture with `ENABLE_PARITY_HARNESS` unset.**
  The harness wraps `buildGameStateForSnapshot`, which is exactly what that
  capture measures; leaving it on inflates the numbers. The harness is otherwise
  reusable by design (`npm run test-parity` / `test-parity-undo`, and an exported
  pure `compareSnapshotRecords`), which is what `P3-PB4` eventually retires.

Three sequencing calls worth stating explicitly, since none is obvious from
reading the plan linearly:

**Step 10 (the lint fix) is not a Phase B unit.** The plan buries it at the end of
Phase B but says in two places that it must land *in the same PR* as the
non-optional generated-module import. It is folded into `P3-PA1`.

The stated reason was wrong, though the sequencing was right. `P3-PA1`
(`75665d015`) measured it: `eslint.config.mjs` spreads
`eslintPluginImportX.flatConfigs.recommended` into an object literal that later
declares its own `rules` key, which replaces the spread rules wholesale, so
`import-x/no-unresolved` is **not** enabled and a non-optional import of a
missing module does not break the lint job. `npx eslint --print-config` shows
`import-x/newline-after-import` as the only active import-x rule. The real hazard
is the reverse — once a contributor has built locally, the generated artifact
exists and would be linted against `@stylistic/all-flat` — so the fix is an
`ignores` entry, not a resolver carve-out. Plan 3 Phase B step 10 is corrected in
the same commit.

**Step 7 (the decorator split) is sequenced before the cutover, not after.** The
plan lists it as Phase B step 7 with the rationale "do it now, while touching
every call site anyway." Landing it *before* `P3-PB2` gets the mechanical
call-site sweep reviewed on its own and takes it out of the largest diff in the
roadmap.

**`P3-PB1` landed (`4d9171039`).** `stateMap`/`stateSet`/`stateArray` exist as
real decorators backed by `ValueMap`/`ValueSet`/`ValueArray`, whose overridden
mutators are the value-collection hook Plan 4 needs; the nine affected fields
are retargeted with no declared-type changes. Bare `@stateValue()` now rejects
`Map`/`Set`/`Array` at compile time, so a collection-typed state field cannot be
declared without naming its kind, and the one genuinely-generic field keeps an
`{ allowGenericValue: true }` escape hatch guarded by a custom lint rule. Three
things `P3-PB2` should take from it:

- **`scripts/stateSerializerModel.js`'s decorator tables now carry six field
  decorator names, not three.** Both `FIELD_DECORATOR_TO_KIND` and
  `DECORATOR_SCAN_NAMES` gained `stateMap`/`stateSet`/`stateArray`, all mapped
  to kind `'value'`. The generated artifact and schema-surface hash were
  byte-identical across that change, verified by regeneration and diff — adding
  a decorator name that maps to an existing kind is provably inert, which is
  useful precedent if the cutover adds more.
- **Do not rebuild a `ValueArray` with `length =` plus index assignment.** That
  recipe (copied from `UndoArray`) produces a holey array that `v8.serialize`
  writes with the sparse tag, measured ~9% larger on a 200-entry watcher
  payload. `ValueArray.from(arr).init(go, prop)` stays dense and byte-identical
  to a plain array. A byte-parity spec guards it with `Buffer.compare`.
- **`ValueMap`/`ValueSet` deliberately have no `#init` field.** Private fields
  are not merely unreadable-as-`undefined` but *throw* inside a mutator that
  `super(entries)` invokes during construction, so an `#init`-style guard cannot
  work there. When Plan 4 adds the real hook body, put it in the constructor
  after `super()`, or use a `WeakSet` keyed by `this`, or route construction
  through `.init()` after an empty `super()` as `ValueArray` does. Note the
  pre-existing `UndoMap`/`UndoSet` still carry this latent hazard and *do* read
  `#init`; that is tracked separately, not by this unit.

**`P3-PB2` landed (`22b81cf3b`) and Plan 3 Phase B steps 1–5 are complete.** The
state bag, `copyState`, the hydration-closure metadata and thirteen `I*State`
bag views are deleted; capture and restore run through the generated per-class
serializers; `IGameSnapshot.states` and `Game.state` are JSON-safe records.
`reconcileUpdatedCardZoneMemberships` was **not** ported, consuming `P3-PA3`'s
measured answer. Four things the remaining Phase B units should take from it:

- **`oldState` is a complete pre-pass inside `rollbackToSnapshot`, not an
  interleaved read.** An encoder throw is deterministic, so an interleaved pass
  would tear the object graph and its recovery would re-run the identical
  encode and fail identically. The pre-pass mutates nothing before it can fail,
  so an abort declines the undo and leaves the game intact. Do not "optimize" it
  back inline.
- **It is a real new per-rollback cost** — ≈141 objects and ≈2,350 encoded
  fields, ≈ one `full/buildGameStateForSnapshot` pass minus the cull — and it is
  `P3-PB3`'s named first lever. The exact decidable narrowing, if the capture
  shows it matters, is to serialize only instances whose lifecycle hook differs
  from the base (`go.afterSetState !== GameObjectBase.prototype.afterSetState`,
  likewise the other two), which trades away the whole-population encodability
  proof the pre-pass currently buys.
- **`payload/gameStateBuffer` and `payload/gameObjectStatesBuffer` changed
  meaning** and now carry `notes.measurement` provenance. They measure a
  measurement-only `v8.serialize` of the JSON record, inflated by `$map`/`$set`
  tagging and lost identity dedup, so they are not a clean content-volume
  comparison. `payload/retainedChain` is the load-bearing row for the plan's
  JSON-vs-`v8`-at-rest fallback decision.
- **The parity harness is repointed, not retired.** `PARITY_RESTORE_MODE` and
  the four `*-generated` scripts are gone with the comparison legs; the harness
  now wraps each registry entry's `deserialize` plus `rollbackToSnapshot`, and
  runs a round-trip self-check plus a wrapper-identity check. `P3-PB4` still
  owns step 8's golden fixtures, which remain the real successor. A green parity
  run is **not** evidence for the `_hasRef` latch contract — the round-trip is
  structurally blind to it.

**`P3-PB2` is genuinely atomic and cannot be split further.** You cannot delete
the state bag and not have the new restore path in the same commit. This is the
highest-risk unit in the whole roadmap. If the implement stage does not converge
within `IMPL_REVIEW_CAP = 2` rounds, that is the signal to stop and reconsider
the approach with a human — not to raise the cap.

### `P3-PA0` — StateWatcher bag migration

Run this **after** `P2-A2` if both plans are in flight. There is no hard code
conflict — `P2-A2` writes save-file encoders that *read* watcher entries, while
this changes how entries are *stored* — but `P2-A2` produces a complete
per-watcher field inventory that this unit's encoder work would otherwise have to
re-derive. The plan itself points at Plan 2's watcher section for the same survey.

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 0 (Migrate StateWatcher off direct state-bag writes) ONLY. The plan explicitly says this lands first as its own PR, before the rest of Phase A. Scope fence: do NOT port the generator, do NOT build any parity harness, do NOT touch Phase A steps 1-6 or any of Phase B. In scope: change StateWatcher's entries to `@stateValue() private accessor entries: TState[] = []`, route reads through the accessor, delete the constructor bag-write, and retire CopyMode.UseBulkCopy plus copyState's bulkCopyMetadata branch (StateWatcher is their only user). v2's cutover commit 7e6545fd7 is the template. Audit for other direct bag writers, but note two known non-hits: TokenCards.ts uses `declare state: never` (inert), and the ~30 `this.state.` matches in Game.ts are Game.state: IGameState, not the bag - Game is not a GameObjectBase. This changes watcher restore from bulk-copy to field-copy - same data, different mechanism - so gate on the full suite plus `npm run test-undo` before considering it done. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa0
```

### `P3-PA1` — Generator + record format + lint fix

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A steps 1 and 2, PLUS Phase B step 6's registry key policy, PLUS Phase B step 10's lint-job fix. Phase A step 0 has landed. Scope fence: do NOT build the parity harness (steps 3-4), do NOT build the coverage cross-check (step 5), do NOT begin the cutover. Step 10 is included here and NOT deferred to Phase B: the plan states in two places that the lint fix must land in the same PR as the non-optional generated-module import, because .github/workflows/pullrequest.yml:24 runs eslint with no build step and would break on every PR otherwise; the chosen shape is a resolver carve-out for the generated path, not full generation in the lint job. Required elements: the ts-morph generator with static mixin-chain resolution; the gitignored + build-step + hard-fail generated-file policy with a non-optional runtime import; the generation cache (cheap text scan for decorator names before instantiating ts-morph, hashing the candidate set plus the transitive mixin files the resolver visited on the last run - embed BOTH in the artifact header, because a pure mixin-composition file like AllAbilityTypeRegistrations.ts mentions no decorator name yet sits in the ancestry of every InPlayCard); the recursive JSON-safe record encoders with the $map/$set tag vocabulary, which THROW on anything they cannot tag-encode; and the schema-surface hash, which is DISTINCT from the generation cache hash - its inputs are only the semantic surface (sorted classTag to sorted field names plus field kinds, the encoding-tag vocabulary, the engine-tier format version), so comment edits and refactors must not change it, because Plan 6 gates save compatibility on it. Two hard requirements from the plan: generated serializers must be SIDE-EFFECT-FREE, reading go.uuid directly and never calling getObjectId() - this is what keeps main's remove-then-serialize snapshot order valid, and it is why -morph's order flip must NOT be ported. And the registry must cover the two card-file-local @registerState classes (FirstLightHeadquartersOfTheCrimsonDawn.ts and Advantage.ts - Bamboozle.ts no longer has one as of #2694; re-grep server/game/cards for @registerState at plan time rather than trusting this list); the two non-exported classes (FirstLightSmuggleAction, and CustomDurationEvent, which is in core's OngoingEffectEngine.ts, not under cards/) are exported so the registry can import them, and the generator hard-forbids new module-local @registerState classes going forward. Do a one-time audit of current stateValue payloads inspecting STORED values, not declared types - the plan names DefeatedCardEntry.wasDefeatedWhileAttacking as a case where the declared type carries a live Player but the updater actually stores a boolean. Record cold and warm generator wall-clock as acceptance numbers. The old system stays authoritative throughout this unit. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa1
```

### `P3-PA2` — Parity harness, serialize leg

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 3 (Parity harness, serialize leg) ONLY. Steps 0-2 have landed; the generator exists and the old system is still authoritative. Scope fence: do NOT implement step 4 (the restore leg) or step 5 (the coverage cross-check); do NOT begin the cutover. Build the test-mode hook that runs both the existing getStateUnsafe()+v8 path and the generated serializer at every snapshot point, normalizes, and deep-compares per uuid. Three requirements that decide whether this harness is trustworthy: it must be SIDE-EFFECT-FREE (read refs via .uuid, never getObjectId()); the normalizer must define undefined-equals-null for ref-typed fields up front, because main's bag stores newValue?.getObjectId() so undefined genuinely occurs while generated encoders emit `?? null`; and Maps/Sets are compared in ITERATION ORDER, not sorted - the order is deterministic and survives the v8 round-trip, and sorting would need comparators for object values. Run the full suite and `npm run test-undo` under the harness. Any mismatch is a Phase A bug in the generator, not a reason to loosen the normalizer - this is precisely the gate the ts-morph-v2 branch skipped. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa2
```

### `P3-PA3` — Parity harness, restore leg

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 4 (Parity harness, restore leg) ONLY. Steps 0-3 have landed. Scope fence: do NOT implement step 5, do NOT begin the cutover. The deserializers mutate live state through a completely different mechanism than copyState's hydrator walk, and the point of this unit is that they must not get their first real exercise at cutover. Run the undo suite twice behind a flag - once restoring via the old path, once via the generated deserializers - and compare resulting field values after each rollback, or restore a shadow copy and diff. One specific question this unit exists to ANSWER, and it must be answered explicitly in the evidence: whether -morph's reconcileUpdatedCardZoneMemberships is needed on main. It exists on that branch because of restore-side effects, and a serialize-only comparison structurally cannot tell you. Report the finding either way, because the cutover unit consumes it. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa3
```

### `P3-PA4` — Coverage/staleness cross-check

**Two follow-ups inherited from `P3-PA3`**, both deliberately deferred there rather than spending its exhausted repair budget. Both are small, both live in `test/helpers/ParityHarness.ts`, and neither blocks anything. Note this unit does not otherwise touch that file — its own scope is the decorator-metadata cross-check, and it depends on the generator rather than on the parity harness — so these are a deliberate addition to its scope, carried in the invocation block below rather than only in this prose.

1. **Zone-class tally for the masked population (~4 lines).** `recordZoneViolation` caps each retention buffer at 10 identities, so `P3-PA3`'s net-width statement is a *sampled* characterization: 10 of 78 pre-rollback forward violations were identified, and those 10 span four deck-resident cards. Adding a `Map<zoneClass, count>` alongside the identity buffer makes the statement exhaustive at the class level without unbounded retention. Worth doing because `P3-PB2` reads that net width when deciding about `reconcileUpdatedCardZoneMemberships`.
2. **Reporter run-directory hygiene.** `getReporterRunDir()` keys on `process.ppid`, which is the jasmine primary under `--parallel` but the invoking shell in a serial run — and `P3-PA3` established the serial run as the complete-coverage evidence mode, so serial invocations are now expected. The directory is also never pruned. A run-start timestamp suffix fixes both; short of that, note in the header comment that boot/exit counts are only meaningful for a directory known to hold a single run.

Read `P3-PA3`'s entry in [ANVIL-LOG.md](ANVIL-LOG.md) before starting: it records why a parallel `[ParityHarness] pid=` line is only ~75% coverage in undo mode and unbounded in non-undo mode, which bears directly on how this unit reports its own cross-check results.

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 5 (Coverage/staleness cross-check) ONLY. Steps 0-2 have landed (this unit depends on the generator, not on the parity harness, so it may run in parallel with steps 3-4). Scope fence: do NOT begin the cutover. Compare the runtime decorator metadata field set AND per-field kind against the generated serializer's model per class, and HARD-FAIL on any delta. Kinds matter as much as names: once the Phase A parity gate retires, a kind misclassification on a new field would sail through a name-set check and mis-encode silently. This must run both at dev startup and in a spec that force-loads every module containing a registered class - reuse the card-loading path that validate-cards exercises, because decorator metadata materializes at module load, and card-file classes like FirstLightHeadquartersOfTheCrimsonDawn.ts's load only via dynamic card import, so a dev-startup check alone would never see them. The reason this check exists rather than a source-content hash is that it works in a compiled production build where the TS sources are absent. Acceptance requires demonstrating that it FAILS when a field is deliberately hidden from the generator - a green check that cannot go red proves nothing. ALSO IN SCOPE, two small follow-ups inherited from P3-PA3, both in test/helpers/ParityHarness.ts and both described in the prose above this block: (1) add a Map of zoneClass to count alongside recordZoneViolation's 10-identity retention buffer, so the masked-population statement P3-PB2 consumes is exhaustive at the class level rather than sampled at 10 of 78; (2) fix reporter run-directory hygiene, since getReporterRunDir() keys on process.ppid - the jasmine primary under --parallel but the invoking shell in a serial run, which P3-PA3 established as the complete-coverage evidence mode - and the directory is never pruned. Read P3-PA3's ANVIL-LOG.md entry before starting: it records why a parallel ParityHarness pid= reporter line is only about 75% coverage in undo mode and unbounded in non-undo mode, which bears on how this unit reports its own results. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa4
```

### `P3-PB1` — Decorator collection split

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase B step 7 (Value-collection mutation / the stateMap-stateSet-stateArray decorator split) ONLY, sequenced BEFORE the cutover rather than after. All of Phase A has landed and the old system is still authoritative. Scope fence: do NOT delete the state bag, do NOT change IGameSnapshot.states, do NOT touch Phase B steps 1-6 or 8-10. Rationale for doing this now: it is a mechanical sweep across every call site, it is a known -morph TODO, and landing it separately keeps it out of the cutover's diff - which is already the largest in the roadmap. The substance: with live Maps/Sets/arrays in native fields, in-place mutation of a stateValue-typed collection is invisible to the retained setters, since only whole-value reassignment is observed. Give stateMap/stateSet/stateArray wrappers on the ref-collection pattern. This is not load-bearing for full snapshots (serialization reads current contents) but it IS load-bearing for Plan 4, which needs the value-collection hook. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pb1
```

### `P3-PB2` — The cutover

```bash
/orchestrate --tier 4 Implement docs/plans/03-codegen-serializers.md Phase B steps 1 through 5 - the cutover. Proof level: hardened. All of Phase A has landed, the parity harness is green on both legs, the coverage cross-check is in place, and the decorator collection split (step 7) has landed. Scope fence: do NOT do step 8 (retiring the parity harness - that is deferred a release), do NOT do step 9 (docs), do NOT touch Plan 4 work. Steps 6, 7, and 10 have already landed in earlier units. This is an ATOMIC change and cannot be partially landed: deleting the state bag requires the new restore path in the same commit. Five things must all hold. (1) Slim the decorators, delete the bag (GameObjectBase.state, setState, getStateUnsafe, getState), copyState, and the hydration-closure metadata - but KEEP the decorator metadata field-name recording, because the coverage cross-check depends on it. Snapshot order stays remove-then-serialize, which is valid because eager marking stays and serializers are side-effect-free. (2) Game.state moves to the same record format, not left v8-serialized, and its restore DEEP-CLONES the stored record - never assign the retained record by reference, because the live game mutates it in place (winnerNames.push, allCards.push, movedCards.push) and today's freshness guarantee is v8.deserialize. Do NOT go further and make Game.state a GameObject - that is Plan 4. (3) Deserializers assign fields THROUGH the retained accessor setters, never raw backing storage: the setters are what re-wrap UndoArray/UndoMap/UndoSet/UndoSafeRecord and re-latch _hasRef on restore. Get this wrong and after the first rollback every mutable ref collection is a plain array/Map/Set, later pushes never latch, the object is culled at the next snapshot, and the rollback after that dies in getFromUuidUnsafe with SevereHaltGame. Ship the spec that asserts deckZone.deck is still the wrapper type after a rollback. (4) Deserializers must never alias values out of the stored record; ship the double-rollback spec (roll back to the same snapshot twice with mutation in between, assert identical results), and the mutations must include at least one game-level array so the Game.state clone rule is exercised too. (5) oldState for the lifecycle hooks is manufactured at rollback time by running the generated serializer on each live object immediately before overwriting or removing it; retype the hook signatures with the generated ISerialized* interfaces and delete the orphaned I*State bag views. Note explicitly that this is a per-rollback serialize pass main currently avoids by design, and it MUST appear in the benchmark as rollback time including the oldState pass, or the replace-runtime-cost claim is overstated for the rollback path. Preserve the lifecycle contract exactly: afterSetState per object, then removals plus cleanupOnRemove, then afterSetAllState. Include -morph's zone-membership reconciliation only if unit P3-PA3's restore-leg evidence showed it is needed on main - check that evidence rather than assuming. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pb2
```

### `P3-PB3` ⏱ — Docs + capture

```bash
/orchestrate --fast Implement docs/plans/03-codegen-serializers.md Phase B step 9 (developer docs) ONLY: update docs/ so the "adding a state field" workflow includes the codegen step, and document the hard-fail behavior when the generated artifact is missing or stale. Scope fence: no production code changes; do NOT retire the parity harness (step 8 is deliberately deferred one release cycle). This is the FINAL scheduled unit of Plan 3: after the docs land, run `npm run benchmark -- --name after-plan-03 --compare pre-roadmap-baseline` and commit both generated files under docs/plans/performance/. Note in the plan doc that Plan 3 is expected to trade build-time complexity for runtime cost, and quantify any headline-benchmark regression rather than waving it through. The capture is not a report here - it has four specific questions to answer, all recorded by `P3-PB2` in 03-codegen-serializers.md (Phase B step 5, and the "Benchmark maintenance" section at the end); read both before running it. (1) How much of the `full/rollbackToSnapshot` and `manager/rollbackTo(Manual)` delta is the new per-rollback `oldState` pre-pass? `full/buildGameStateForSnapshot` is the lower bound. The pre-pass is the named first lever if rollback regressed, and the plan doc gives the exact decidable narrowing and what it costs. (2) `payload/retainedChain` bytes PER RETAINED SNAPSHOT, before vs after - snapshots are live object graphs now, not one contiguous Buffer, and the multiplier could not be bounded from code. (3) Does that ratio cross the threshold that triggers the plan's documented JSON-vs-v8-at-rest fallback? (4) Did `sustained/snapshotAndUndoCycle`'s GC count and pause move, since every rollback now allocates a full snapshot's worth of short-lived garbage? Also note before reading the numbers: `payload/gameStateBuffer`, `payload/gameObjectStatesBuffer` and `payload/fullSnapshotTotal` changed meaning at `P3-PB2` and carry a `notes.measurement` tag saying so - they are a v8-equivalent size of the retained JSON record, not stored bytes, and they inflate relative to the baseline for two structural reasons the plan doc names. task_id: p3-pb3
```

**`P3-PB3` landed and Plan 3 is complete.** `docs/state-fields.md` documents the
"adding a state field" workflow (decorator kinds, the automatic codegen step
built into every `npm run build*`/`test*` entry point, `--print-model` for
inspecting the generated model) and the two hard-fail modes: a missing
generated artifact is a `tsc TS2307` build error (`StateSerializers.ts`'s
non-optional import), and a stale one fails loudly via
`checkStateSerializerCoverage` (dev-startup boot and
`StateSerializerCoverageCheck.spec.ts`), both documented with their actual
error shapes. `docs/plans/03-codegen-serializers.md` records the `P3-PB3`
capture's answers to its four named questions inline at Phase B step 5 and the
"Benchmark maintenance" section. Headline result, contrary to this plan's own
risk note: **every measured `manager/*`, `payload/*` and `sustained/*` row
improved** (`after-plan-03` vs. `pre-roadmap-baseline`) — rollback timing down
44%–60%, retained-chain memory down 13%–17%, GC pause time down 6x–8x — so the
documented JSON-vs-`v8`-at-rest fallback is not triggered and was not adopted.
The card-memory sub-benchmark was skipped (`--skip-card-memory`) due to a
pre-existing, Plan-3-unrelated gap in `scripts/card-memory-benchmark.js`
exposed by two newer zero-stat Fortify upgrade cards; flagged separately for a
follow-up fix, not blocking this unit.

### `P3-PB4` — Retire the parity harness *(deferred)*

Phase B step 8 says to keep the harness behind a flag for **one release cycle**,
comparing against committed golden serialized records, then delete it. Do not
schedule this with the rest of Plan 3 — put it on the calendar one release after
`P3-PB2` lands. It is a `/orchestrate --fast` unit when its time comes.

---

## Re-anchoring survey for Plans 4–6 (post-Plan-3 ground truth)

Surveyed 2026-09-20 against `56e2579ab`, the tree Plan 3 left behind. Every file and line reference in `04-delta-snapshots.md`, `05-gameobject-recreation.md` and `06-full-fidelity-save.md` is still anchored to `7a0526549`, and **none of those docs has been corrected**: this section is the drift record, and the plan docs are amended separately, by hand, after deciding which items warrant it. Line numbers cited as "now" are for `56e2579ab` and will drift again; treat them as pointers.

### The five facts the decomposition depended on

1. **The generated serializer module.** `server/game/core/generated/GeneratedStateSerializers.ts` (gitignored; regenerated by every `build*`/`test*` entry point through `scripts/generate-state-serializers.js`; 3,564 lines at HEAD). Per class it emits `export type ISerialized<Class> = { _uuid: SerializedPrimitive; <field>: <encoded type> }` — a `type` alias, not an `interface`, because the lifecycle hooks narrow `SerializedStateRecord` and an interface fails `TS2416` — plus `serialize<Class>(instance)` and `deserialize<Class>(game, instance, record)`. **Records carry no class identity**: there is no `classTag` in any record yet. The registry is `generatedStateSerializerEntries: IGeneratedSerializerEntry[]` — `{ className, decorator, isAbstract, fields: [{ name, kind }], serializer }`, 126 entries (28 abstract) — consumed by `server/game/core/StateSerializers.ts`, which keys a `Map<string, entry>` by class name and resolves an instance with `getStateSerializerFor(instance)` by walking `constructor.name` up the prototype chain, memoized per constructor. The two card-file-local classes (`FirstLightSmuggleAction`, `AdvantageAbility`) are registry entries; both formerly non-exported classes are exported now (`FirstLightHeadquartersOfTheCrimsonDawn.ts:42`, `OngoingEffectEngine.ts:193`), and `scripts/stateSerializerModel.js:200-202` hard-fails generation on any non-abstract, non-exported target. Plan 5 A1's "Decided" paragraph is therefore already implemented by `P3-PA1`.
2. **The schema-surface hash.** `GENERATED_SCHEMA_SURFACE_HASH` and `GENERATED_SCHEMA_FORMAT_VERSION` are emitted at the bottom of the generated module and re-exported from `server/game/core/StateSerializers.ts`. `computeSchemaSurfaceHash` (`scripts/stateSerializerModel.js:158-176`) hashes exactly three things: the sorted `ClassName=>field:kind,...` lines of the resolved model, the sorted encoding-tag vocabulary (`STATE_ENCODING_TAGS = ['$map', '$set', '$num']` in `StateEncoding.ts`), and `STATE_RECORD_FORMAT_VERSION` (currently `1`). Not inputs: `decorator`, `isAbstract`, declaration form, and — the two gaps Plan 6 D must know about — **recipe-section field names** (no recipe sections exist yet; Plan 5 A4 has to add that input) and **the shape of `Game.state`**, which is encoded by `encodeStateValue` outside the registry (recorded by `P3-PB2` in `03-codegen-serializers.md`, Phase B step 2). A field added to `IGameState` today changes every snapshot payload with the hash still green. That gap closes when Plan 4 promotes `Game.state` into the registry (`P4-B`), which is therefore a hard prerequisite of `P6-D`.
3. **The hook points.** Override bodies are still centralized in `server/game/core/GameObjectUtils.ts`, as Plan 3's non-goals required: seven decorators (`statePrimitive :372`, `stateRefArray :411`, `stateRefMap :475`, `stateRefSet :514`, `stateRefRecord :553`, `stateRef :592`, `stateValue :694`) plus the `P3-PB1` trio (`stateMap :743`, `stateSet :785`, `stateArray :830`), each with thin `get`/`set`/`init` bodies whose only work is eager `markStateRef*` latching (ref kinds) or the dev-mode JSON-safety assert (value kinds). In-place mutation is observable in exactly these wrappers: `UndoMap.set/delete/clear`, `UndoSet.add/delete/clear`, `UndoArray.push/unshift/pop/shift/reverse/splice` (`sort`/`fill` throw), the `UndoSafeRecord` proxy's `set`/`deleteProperty` traps (`:1057`), and `ValueMap :1363` / `ValueSet :1421` / `ValueArray :1473`, whose mutators carry literal `// Plan 4 hook point` comments. Index assignment and `length =` on any array remain uninterceptable. The `#go`/`#prop` fields on the `Undo*` wrappers are write-only and were kept explicitly as Plan 4's hook data. Per-field encoders are individually addressable: `encodeStateValue`/`decodeStateValue`, `encodeRef`/`decodeRef`, and the `RefArray`/`RefMap`/`RefSet`/`RefRecord` pairs are named exports of `server/game/core/StateEncoding.ts`. The generated per-class functions are whole-record only, so a delta value for `(class, field)` reuses the `StateEncoding` primitive for that field's kind, selected from the registry entry's `fields[]`. One constraint Plan 4 inherits from `P3-PB1`: `ValueMap`/`ValueSet` mutators run inside `super(entries)` before private fields exist, so a hook body must not read `#go`/`#prop` — use a `WeakMap` keyed by `this`, a try/catch, or route population through `.init()` after an empty `super()`.
4. **The rollback lifecycle after the cutover** (`GameStateManager.rollbackToSnapshot`, `:191-352`). (a) A complete pre-pass serializes every live object into `oldStates` before any mutation, in its own `try` (`:213-252`); an encoder throw aborts with the game intact and returns `false`. (b) Inside the restore `try`: `game.state = decodeStateValue(snapshot.gameState)` (`:258`), then the update loop last-to-first over `allGameObjects` — per object either `deserialize` through the accessor setters followed by `afterSetState(oldState)` (`:274-276`), or queued for removal when the uuid is absent from `snapshot.states` (`:270`); then `cleanupOnRemove(oldState)` per removal (`:279-281`). (c) Recovery on throw via the nested `rollbackToSnapshot(beforeRollbackSnapshot)`, with a `false` converted to a throw (`:303-322`). (d) Registry removal (`:325-331`). (e) `afterSetAllState(oldState)` per update in reverse-registration order (`:340-342`; the order is pinned so `OngoingEffect.refreshContext` runs before `OngoingEffectEngine.resolveEffects`). (f) `restoreLastGameObjectId(snapshot)` (`:346`), then `_rollbackDepth--` in `finally`. So `oldState` is manufactured for **every** live object by the pre-pass, not only for updated ones, and registration during rollback hard-fails in `register()` (`:107-111`) on a depth counter that only `withRegistrationGuardSuspended` relaxes, for error reporting.
5. **`reconcileUpdatedCardZoneMemberships`** is **not needed on main's full-snapshot restore path** (`P3-PA3`, `761d82d66`; consumed by `P3-PB2`, not ported). Structurally it is a `-morph` delta-rollback-only artifact: one call site, inside `rollbackToDeltaChain`, with delta-shaped inputs. Empirically: zero forward and reverse zone violations across 8,186 serial rollbacks plus ~6,200 parallel ones, under four labels — the zone counters have no injected falsifier; complete coverage exists only for the compare+undo serial run; the masked population is 78 pre-existing `DeckZone` pairs (exhaustive at class level after `P3-PA4`); `AllArenasZone` is excluded from the reverse pass by design. Consequence for Plan 4: the evidence covers the full path only, so whether the **delta** path needs it is an open question `P4-F` answers by measurement on its own restore, not by inheritance. Consequence for Plan 5: recreation runs on the full path before the overlay, so the answer stands for it.

### Drift, Plan 4 (`04-delta-snapshots.md`)

- Says (`:4`, `:21-23`) the hooks are the retained decorator setters plus the `UndoArray`/`UndoMap`/`UndoSet` wrappers; it is now those plus `UndoSafeRecord` and the `ValueMap`/`ValueSet`/`ValueArray` trio behind `stateMap`/`stateSet`/`stateArray` (`P3-PB1`), with the literal hook-point comments in place. The prior-art item 1 test list (`:307-315`) must add the three `Value*` variants.
- Says (`:36-39`) the delta payload is "bufferless … no `gameState` buffer, no `states` buffer"; snapshots are already bufferless records (`IGameSnapshot.states: Record<string, SerializedStateRecord>`, `gameState: unknown`, `SnapshotInterfaces.ts:126-142`). The distinction the plan draws against `quick-undo-deltas` no longer exists; delta old values are simply `StateEncoding` records.
- Says (`:46-54`) promoting `Game.state` "removes the per-delta `v8.serialize(Game.state)`"; there is no `v8.serialize` left to remove — `SnapshotFactory.ts:151` encodes it with `encodeStateValue`, `GameStateManager.ts:258` decodes it. The port of `-morph`'s `GameState.ts` now targets `@stateArray` for `winnerNames`/`allCards`/`movedCards` (the three in-place-mutated arrays, `Game.ts:1246`, `:1641-1662`), `@stateRef` for the three player refs, `@statePrimitive` for the scalars; `Game.state` is initialized as a literal at `Game.ts:460-473` and read at roughly thirty `this.state.` sites. The step has a new load-bearing reason: it closes the schema-hash gap (fact 2).
- Says (`:85-90`) `SnapshotManager.ts:457-474` for `opponentActedSinceLastSnapshot`; now `:457-475` (coincidentally stable). The `TODO THIS PR` formerly at `:328` is gone — `P4-0` resolved it for Sneak Attack's and Thrawn's own boundary triggers; a narrower, separate defect remains deferred to `P4-0b` (see `04-delta-snapshots.md`'s "Known limitations (deferred)").
- Says (`:150-158`) the recovery snapshot is "a real per-rollback cost"; `SnapshotContainerBase.ts:72` is now `:72-80` and `GameStateManager.ts:190-199` is now `:303-322`, and the `P3-PB2` pre-pass already serializes every live object per rollback into `oldStates`. The recovery snapshot can be assembled from that array at no second serialize — settle at `P4-F`'s plan gate.
- Says (`:170-182`) the delta path must manufacture `oldState` for untouched objects; main's pre-pass already manufactures it for every object. The pinned delta lifecycle order must be reconciled with the current full order in fact 4, and `reconcileUpdatedCardZoneMemberships` is not on main (fact 5).
- Says (`:203-222`) `_isRollingBack` at `GameStateManager.ts:35-36` and "if Plan 1 item B has not landed first"; it is `_rollbackDepth` at `:48` with the `isRollingBack` getter at `:55`, the guard is live in `register()` `:107-111` (`P1-B`, `5787a3314`), and the conditional is moot. `-morph`'s `recordObjectCreation` inside the `!_disableRegistration` guard maps to `:120-131`.
- Says (`:242-246`) the loader must not start the tracker before the first full snapshot; **verified honored**: `MatchLoader.ts:428-431` calls `clearAllSnapshots()` then `postRollbackOperations` with no snapshot seeding, and `ActionWindow.checkUpdateSnapshot` (`ActionWindow.ts:117`) takes the first snapshot. Two obligations the plan does not name: `SnapshotManager.clearAllSnapshots` (`:480-488`) must also stop the tracker and clear the delta index, because the loader calls it on a game that may be mid-window (harness games save mid-run); and `SnapshotFactory.clearCurrentSnapshot` (`:120`) leaves no anchor, so `startTracking` must be armed by the next `createSnapshotForCurrentTimepoint`.
- Says (`:264`) `Game.ts:1794` for `takeManualSnapshot`; now `:1909`.
- Says (`:279-297`) `IntegrationHelper.js:50`, `:249-253`, `:254-257`; now `:59-64` (`buildStartOfTestSnapshot`), `:269-273` (which calls `game.rollbackToSnapshotInternal`, not `rollbackToSnapshot`), and `:274-277` (the silent skip). Also `:279-281` restores chat after rollback, which any delta-vs-full parity compare must exclude.
- Says (`:335-338`) "verify the `stateMap`/`stateSet`/`stateArray` split is present"; present (`4d9171039`). Says (`:339-342`) residual `go.state` references "should already be gone"; gone (`22b81cf3b`, grep clean).
- Performance section (`:417-466`): `payload/gameStateBuffer`, `payload/gameObjectStatesBuffer` and `payload/fullSnapshotTotal` changed meaning at `P3-PB2` (a measurement-only `v8` size of the JSON record, tagged `notes.measurement`), so Plan 4's verdict must declare those rows dishonest across the baseline and read `payload/retainedChain`. `after-plan-03` also shows `manager/moveToNextTimepoint(Action)` flat-to-worse (+6.2% on `forty-cards-per-player`, single run), so snapshot-taking cost is still Plan 4's to move, while rollback fell 44–60%, so the "red flag" threshold for `manager/rollbackTo(Manual)` p95 should be read against `after-plan-03`, not the baseline.
- Decision checkpoint (`:344-366`): a new post-Plan-3 fact changes the trade. Records are plain object graphs now, so a copy-on-write record map shares unchanged records across retained snapshots by reference; the retained-memory disadvantage the plan attributes to memoization at `:358-359` was measured against per-snapshot `v8` buffers, which no longer exist. This is why the fork is decomposed as a gate after memoization lands rather than a spike (see the Plan 4 decisions below).

### Drift, Plan 5 (`05-gameobject-recreation.md`)

- Says (`:17`) the `STATE TODO` at `GameObjectUtils.ts:751`; deleted with `copyState` (`P3-PB2`). Says (`:20`) `_isRollingBack` at `GameStateManager.ts:35-36`; now `_rollbackDepth :48`, guard live.
- Says (`:24`) "as of main `7a0526549`"; the survey is now at `56e2579ab`.
- Says (`:25-27`, blocker 1) `GameStateManager.ts:157-175`; now `:264-277`, and still true: snapshot uuids with no live instance are never visited.
- Says (`:28-47`, blocker 2) ~85 classes have no factory registry and two classes are non-exported; records still carry no class identity, but the registry substrate exists (fact 1), the card-local classes are entries, both classes are exported, and the generator hard-forbids new module-local targets. A1 shrinks to: `classTag` in every record, factory entries, the synchronous card-data cache, and the recipe-section hash input.
- Says (`:63-72`, blocker 6) `GameObjectUtils.ts:263-268`, `:321-327`; now `:270-278` (the wrapped constructor calls `initialize()` at `:275`) and `:356`; unchanged in substance. `UnitProperties.ts:330` is now `:347` (`defaultAttackAction = new InitiateAttackAction`), with the field at `:167`.
- Says (`:90`) `TrackedGameCardMetric` at `GameStatisticsTracker.ts:40`; unchanged.
- Says (`:116-122`) `Deck.ts:207-228` and `Game.ts:1585-1591`; now `Deck.ts:207-218` (still async, `getCardBySetCodeAsync` at `:218`) and `initialiseTokens` at `Game.ts:1690-1698`.
- Says (`:133-140`) `GameObjectBase.ts:87` and a silent overwrite at `GameStateManager.ts:93`; now `:76`, and the overwrite is a hard-fail occupancy check at `:113-115` (`P1-B`). A2's "new occupancy assert" already exists; A2 extends it to the scratch→real rekey rather than introducing it.
- Says (`:148-150`) counter-neutral rehydration "preserves Plan 1B's uuid reproducibility"; `P1-B`'s acceptance (a) is **not met** — replayed ids are bounded within the freed window but not exact (offset +3 measured, driven by prompt-refresh sweep count). Counter-neutrality is still required so the window bound holds; the exact-reproducibility premise is gone.
- Says (`:165-167`) `GameObjectBase.ts:73-76` for the single-assignment uuid assert; now `:63-66`.
- Says (`:186-197`) the recovery path is `GameStateManager.ts:190-199`; now `:303-322`. The `P3-PB2` pre-pass (`:213-252`) is where recreation scopes naturally sit **after** (they need `oldStates` untouched) and before the restore `try`.
- Says (`:220-229`, A3 step 3) `game.state = v8.deserialize(...)` runs first at `:152`; now `game.state = decodeStateValue(...)` at `:258`, still first inside the restore `try`. If `P4-B` lands first, `Game.state` is a registry object and this step is absorbed into the ordinary update loop.
- Says (`:241-246`, A4) `AbilityLimit.ts:107-117`, `:146`; now `PerGameAbilityLimit.currentUser :105`, `.max :106`, `PerPlayerPerGameAbilityLimitBase.max :142`, `RepeatableAbilityLimit.eventName :194`, all still plain fields; `useCount` on the per-player limits is now `@stateMap` (`:71`, `:144`).
- Says (`:263-266`, A5) `Card.ts:1143`, `TriggeredAbility.ts:242`, `:301`; now `:1186`, `:237`, `:296`.
- Says (`:280-282`, A6) `PlayerOrCardAbility.limit :54` and `AbilityLimit.ability :29`; now `:50` and `:25`.
- Says (`:319-323`, `:369`) `Card.ts:319-320`, `:555-562`, `:159-166`; now `nextAbilityIdx :327`, `abilityIdentifier :566-573`, and the ability lists are the `InPlayCard` refArray fields `actionAbilities`/`constantAbilities`/`triggeredAbilities` in the generated model.
- Says (`:385-386`, `:548`) `GainAbility._abilityUuidByTargetCard` is a `@stateValue Map` at `:28` with a TODO at `:82`; it is `@stateMap` at `:20` (a `ValueMap`, so an in-place hook exists), dereferenced at `:104-120`.
- Says (`:447-449`) the wrapper value is a plain field at `OngoingEffectValueWrapper.ts:11`; still true for `OngoingEffectValueWrapperBase.value :11`, and the decorated subset lives in `MutableOngoingEffectValueWrapper._value` (`@stateValue({ allowGenericValue: true })`) — Plan 1A option 1, see decisions.
- Says (`:463-481`) `OngoingEffectEngine.ts:90-94`, `:313-320`, `:20-33`; now `:261` (the `Duration.Custom` gate), `createCustomDurationHandler :550-558` (still private), and `CustomDurationEvent :193-232` (plain `name`/`handler`/`effect` fields, `isRegistered` decorated, now exported).
- Says (`:549`) the StateWatcher dev check at `StateWatcher.ts:90-114`; entries are `@stateValue entries` since `P3-PA0`, and the write-site JSON-safety assert is the gate.
- Says (`:566-571`) `Player.ts:772`, `CaptureZone.ts:18-21`, `OngoingEffect.ts:48-57`; now `:757`, `:18`, `:44-53`.
- Says (`:580-582`) `afterTakeSnapshot` at `:225-228` and `removeUnusedGameObjects` at `:98-118` called at `:136-141`; now `:394-397` (still a dead private stub with no caller) and `:140-158`, called from `buildGameStateForSnapshot :181` and `SnapshotManager.ts:118`.
- Says (`:589-591`) `Card.alwaysTrackState` at `Card.ts:229-231`; now `:236`. `GameObjectBase.ts:53-55` is `:52-55`.
- Plan-4 coupling (`:4`, `:638-645`): Plan 4 is decomposed below with its delta stage **conditional** on `P4-D`; every Plan 5 fence that touches the coupling names both cases.
- New hazard from `P1-B` the plan predates: `removeUnusedGameObjects` drops still-alive ref-less objects while a replayed object can take the freed id, so `get(uuid)` can return a different live object. 5c's per-uuid liveness replaces the latch this rides on; `P5C-2`'s fence names it.

### Drift, Plan 6 (`06-full-fidelity-save.md`)

- Says (`:4`) it depends on Plans 2, 3, 5; add Plan 4's `P4-B` for work item D (fact 2). Plan 5 stage 5b did **not** discharge any part of work item A: 5b defers both lasting-effect capture and the `CustomDurationEvent` recipe to Plan 6 A explicitly, and nothing in 5b's decomposition below touches them. A stays whole and is sized Large.
- Says (`:42-53`, `:375-389`) the `engineSchemaHash` is a schema-surface hash "specified as a Plan 3 generator deliverable"; it exists (fact 2) with the two coverage gaps — recipe-section field names and `Game.state` — that `P5A-1` and `P4-B` close.
- Says (`:77-79`) `CardLastingEffectSystem.ts:110-120` and `OngoingEffect.ts:48-57`; now `getEffectFactoriesAndProperties :106` and `:44-53`.
- Says (`:137-143`) `Clone.ts:38-51`, `KeywordInstance.ts:7`; now `overridePrintedAttributes :38` with `until :33`, `KeywordInstance :7`, `KeywordWithAbilityDefinition :114`. The three `until` files are unchanged and are still the only `Duration.Custom` card sites (`GiveInToYourAnger.ts:24`, `Clone.ts:32`, `FivesIHaveProof.ts:30`).
- Says (`:166-174`, `:414-421`) `SnapshotManager.ts:402-406` and throws at `:401`, `:408`; now `:401-408` with `EndOfActionPhase` at `:405` and the throws at `:401`, `:408`.
- Says (`:195-200`) `GameStateManager.ts:98-118`; now `:140-158`.
- Says (`:228-245`, B) "today `snapshot.states` is a v8 buffer — `SnapshotFactory.ts:155-156`"; stale, it is already the record map (`SnapshotInterfaces.ts:136`). `Card.ts:113,348` is now `:116`, `:364`; `GameStateManager.ts:204-212` is now `:325-331`. `Lobby.handleError :1794` and `handleSerializationFailure :1854` exist; `handleError`'s `SevereHaltGame` branch calls `captureGameState`, which constructs and registers pristine GameObjects (`P3-PB2` suspends the registration guard around it), so the snapshot-read save path must be ordered before that branch or made independent of it.
- Says (`:278-282`) `GameObjectBase.ts:73-76` and the silent mapping overwrite at `GameStateManager.ts:93`; now `:63-66` and the occupancy hard-fail at `:113-115`.
- Says (`:358-369`) `Game.ts:303,364,669-672` for `_lastAttackId`; now `:322`, `:406`, `:749-750`, still a plain field.
- Says (`:476-479`) `OngoingEffectEngine.ts:290`, `:316-317`; now `:527`, `:553-554`.
- Manifest (`:38-41`, `:216-227`): the shipped `EngineOnlyFactCategory` is `'lastingEffect' | 'gainedAbility' | 'delayedEffect' | 'watcherEntry' | 'pilotLeader' | 'unrepresentedCard'` (`SavedMatchInterfaces.ts:206`). Custom-duration events are not their own category — they are `delayedEffect` with `duration: 'custom'` (`EngineOnlyFacts.ts:171-174`). `pilotLeader` and `unrepresentedCard` (a captive stranded in a `CaptureZone` its captor replaced, found by `P2-E`) are semantic-tier representability gaps Plan 6's list does not mention; `watcherEntry` is an unresolvable-referent drop. Plan 6's "shrink check-by-check" list should be these six categories, not the four at `:216-219`.
- Measured starting residue (`P2-E`, `npm run measure-degradation`, 6,128 boards): **9.9% degrade** — `lastingEffect` 410, `delayedEffect` 129, `gainedAbility` 50, `watcherEntry` 40, `pilotLeader` ~60 post-fix, `unrepresentedCard` 2 — and 0 hard refusals apart from the intended `nextAbilityIdx` drift cases (one on `clone`, which `P6-A1` should look at). `scripts/measure-save-degradation.js` and `test/helpers/SaveDegradationProbe.js` are the substrate the residue measurement extends.
- Loader (`:290-349`): `MatchLoader.loadAsync` (`P2-C2`) is construction, `ScriptedSetupRunner`, `MatchPositionInjector`, the fixed restore order and `postRollbackOperations`, wrapped in a whole-body router-proxy window that converts the engine's report-and-continue into throws. C step 1 reuses the first two and skips the injector; any new engine drive Plan 6 adds must sit inside that window or the swallow hole reopens. `SAVED_MATCH_FORMAT_VERSION = 1`; `cardDataVersion` is on `ISavedMatch :577`. `P2-C2` residual 1 (nested `ISavedAttachedCard` records no controller) is a semantic-tier gap the engine tier makes moot for engine-tier loads but not for D's degradation fallback.

---

## Plan 4 — Delta Snapshots

Ten units: eight unconditional and two (`P4-E`, `P4-F`) that run only if `P4-D`'s verdict is "full deltas". The decomposition follows the plan's own instruction to land hooks, then memoization, then deltas "so the fallback is the intermediate landed state rather than a rewrite".

### Decisions that shape the unit boundaries

**The full-deltas vs memoization fork is a decision gate after memoization lands, not a first-unit spike and not resolved now.** Two reasons. First, the plan pins the evaluation point itself: "after the tracker + hooks land (they are shared by both options), evaluate" — a spike before hooks would decide on estimates the plan says not to trust ("weigh that measured cost, not an estimate"). Second, the evidence needed to resolve it now does not exist: `after-plan-03` shows snapshot-taking cost flat and nothing measures either approach's per-action cost. What *is* new post-Plan-3 tilts the odds: records are plain object graphs, so memoization's copy-on-write record map shares unchanged records across retained snapshots by reference, and the retained-memory advantage the plan reserves for deltas (`:358-359`) has to be re-measured against that, not assumed. So: `P4-A` hooks and tracker, `P4-B` `Game.state` promotion, `P4-C` memoization as a landed and gated state, `P4-D` an interim capture plus the written verdict, then `P4-E`/`P4-F` only on a "deltas" verdict, and `P4-G` ⏱ in either branch. The verdict rule is written in `P4-D`'s invocation so it is not relitigated during implementation.

**The five open issues inherited from `-morph`, enumerated:**

| Issue (`04-delta-snapshots.md`'s "Open issues inherited from `-morph`" section) | Resolvable from current code? | Disposition |
|---|---|---|
| Phase-boundary prompts — `SnapshotManager.ts:328` `TODO THIS PR` (Sneak Attack, Thrawn), single-trigger case | Yes; `getQuickRollbackPoint`'s existing cases already resolve it correctly | Resolved by `P4-0` (TODO removed, specs added in both undo modes); no further unit |
| Phase-boundary prompts — quick-undo overshoot with two-or-more simultaneous boundary triggers, requester already decided part of the window | No; three fix attempts rejected at plan review, see `04-delta-snapshots.md`'s "Known limitations (deferred)" | Own unit, `P4-0b`, independent of the delta chain but a dependency of `P4-F`/`P4-G` |
| In-place mutation of `stateValue` Maps/Sets invisible to setters | Yes: `stateMap`/`stateSet`/`stateArray` landed at `P3-PB1` (`4d9171039`) | Resolved; no unit |
| Silent-failure returns in `rollbackToDeltaSnapshotId` | Yes, by design rule: the contiguity hard-fail replaces them | Folded into `P4-E`'s fence; no unit |
| Residual `go.state` references (`UndoSafeRecord` assert bug) | Yes: the state bag is gone at `P3-PB2`; grep for `getStateUnsafe`/`copyState`/`.setState(` under `server/game` is clean | Resolved; no unit |

**Plan 2's loader honors the anchor contract**, verified rather than assumed (drift list above): it clears all snapshots and re-enters through `postRollbackOperations`, and the re-entered `ActionWindow` takes the first snapshot. The two obligations that fall out — `clearAllSnapshots` stops the tracker and clears the index, and the next `createSnapshotForCurrentTimepoint` arms `startTracking` — are in `P4-A`'s and `P4-E`'s fences.

### Unit table

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P4-0` | Inherited open issue, single-trigger case — removed the `TODO THIS PR` at `SnapshotManager.ts:328`; confirmed and spec'd (both undo modes) that Sneak Attack's and Thrawn's own boundary triggers already resolve correctly; documented the remaining defect and deferred it to `P4-0b` | — | Small 🟢 | full |
| `P4-0b` | Inherited open issue, remainder — fix the quick-rollback overshoot when two-or-more simultaneous Regroup/Setup boundary triggers are pending and the requester has already decided part of the window (see `04-delta-snapshots.md`'s "Known limitations (deferred)" for the mechanism and three rejected attempts) | — | Medium 🟡 | full |
| `P4-1` | Harness hardening — `undoIt` treats a failed manual rollback as a spec failure; only the null-`snapshotId` skip survives | — | Small 🟡 | `--fast` |
| `P4-A` | Delta tracker + recording hooks in every retained setter and wrapper mutator (record-before-mutate, first-write-wins, creation hook, stop/restart at the shared rollback entry, `clearAllSnapshots` integration) | — | Medium 🔴 | full |
| `P4-B` | `Game.state` promoted to a `@registerState` GameObject with `alwaysTrackState` (closes the schema-hash gap) | `P4-A` | Medium 🔴 | full |
| `P4-C` | Per-object serialization memoization: copy-on-write record map reusing unchanged records across snapshots; restore path unchanged | `P4-A`, `P4-B` | Medium 🔴 | full |
| `P4-D` | Decision gate — interim capture `after-plan-04-memo`, verdict written into the plan doc's decision-checkpoint section | `P4-C` | Small 🟡 | full |
| `P4-E` *(conditional)* | Delta index, containers, chain selection, contiguity assert, bridge shared-id rule, age eviction, cadence — in shadow mode (full snapshots still authoritative) | `P4-D` = deltas | Large 🔴 | `--tier 3` |
| `P4-F` *(conditional)* | The delta cutover: rollback protocol, hollow current snapshot + window-start materialization, always-full manual snapshots, harness delta-parity mode | `P4-E`, `P4-0`, `P4-0b`, `P4-1` | Large 🔴 | `--tier 4` |
| `P4-G` ⏱ | Cross-cutting spec sweep, delta diagnostic benchmark rows (new rows only), `after-plan-04` capture, the roadmap performance verdict | `P4-D` (memo branch) or `P4-F` (delta branch); `P4-0b` for its phase-boundary-under-delta-restore specs | Medium 🟡 | full |

`P4-0`, `P4-0b`, and `P4-1` are independent of the delta chain (`P4-A` onward) and may run first or alongside `P4-A`; `P4-F`/`P4-G` still need all three landed first for the reasons in their own rows. The chain: `P4-A → P4-B → P4-C → P4-D → [P4-E → P4-F] → P4-G`.

### `P4-0` — Phase-boundary prompt quick-rollback policy

```bash
/orchestrate Resolve the open issue docs/plans/04-delta-snapshots.md carries under "Open issues inherited from -morph": the `TODO THIS PR` at server/game/core/snapshot/SnapshotManager.ts:328 in getQuickRollbackPoint, which does not account for prompts that open at a phase boundary (Sneak Attack, Thrawn-style start-of-phase triggers). This is a standalone precursor: it fixes main's quick-rollback policy on its own terms and does NOT introduce any delta machinery. Scope fence: touch only the quick-rollback point selection and its specs; do NOT change opponentActedSinceLastSnapshot's 0/1/2 timepoint classification (Plan 4 pins that policy as byte-identical), do NOT change which timepoints exist, do NOT touch Plan 4's mechanism, cadence, or manual-snapshot sections, and do NOT touch the delta tracker (unit P4-A). Settle at the plan gate, not during implementation: what the correct rollback point is for a player who is mid-prompt at a boundary (roll back to the boundary snapshot, or to the previous action), stated as a rule with the card cases as examples. Deliverables: the rule implemented; specs for at least Sneak Attack and Thrawn at the boundary in both undo modes; the TODO removed. Do NOT run the performance capture; that belongs to unit P4-G. task_id: p4-0
```

**Actually delivered, after scope was reduced during planning (three fix attempts for the
full rule were rejected at plan review):** the TODO is removed and both-undo-mode specs exist
for Sneak Attack's and Thrawn's own boundary triggers, which already resolved correctly — "the
rule implemented" above did **not** ship as originally asked. The remaining rule (two-or-more
simultaneous boundary triggers) is `P4-0b`, immediately below.

### `P4-0b` — Phase-boundary prompt quick-rollback policy, remainder (deferred from `P4-0`)

```bash
/orchestrate Implement the fix for the known limitation docs/plans/04-delta-snapshots.md documents under "Known limitations (deferred)": getQuickRollbackPoint (server/game/core/snapshot/SnapshotManager.ts) returns Previous, overshooting into the previous action phase, when a player requests a quick-undo at a Regroup/Setup StartOfPhase boundary after having already decided part of that window's own trigger resolution (order choice, one of several simultaneous triggers) while another player's or the same player's own additional trigger is still pending - it should instead land at the start of the current phase transition. Read that doc section in full before starting: it records three rejected mechanisms (fire on "prompt open" with no decision gating; a per-player per-checkpoint "consumed" marker surviving rollback in MetaSnapshotArray; a per-player "completed a decision-bearing prompt" flag hooked into UiPrompt.complete() with a per-class opt-out list, rejected twice for missing a no-decision prompt class - UndoConfirmationPrompt's Deny, then DisplayCardsBasicPrompt via the shipped Foresight upgrade) and a structural alternative worth designing against first: derive "is a decision" from whether the prompt's own button/selection state offers a real choice, or add an enumeration test that fails CI when a UiPrompt subclass has not declared itself either way. Settle at the plan gate which of those (or another mechanism) to use, with a stated failure-direction justification, before implementing. Scope fence: do NOT change opponentActedSinceLastSnapshot's 0/1/2 timepoint classification, do NOT change which SnapshotTimepoint values exist, do NOT touch Plan 4's delta mechanism, cadence, or manual-snapshot sections, do NOT touch the delta tracker (unit P4-A). Confirmation-mode behavior at this boundary (Game.confirmationRequiredForRollback's three independent triggers, only one of which is live at this exact target) must be derived from an actual run, not predicted. Deliverables: the fix implemented; a regression test for the exact scenario in docs/plans/04-delta-snapshots.md's "Known limitations (deferred)" section, in both undo modes; the two rejected-mechanism traps (Deny-path, DisplayCardsBasicPrompt/Foresight) each covered by an explicit regression test if the chosen mechanism could reintroduce them; the "Known limitations (deferred)" section and this roadmap entry updated to record the resolution. Do NOT run the performance capture; that belongs to unit P4-G. Proof level: hardened. task_id: p4-0b
```

### `P4-1` — Harness hardening

```bash
/orchestrate --fast Implement the harness-leniency removal docs/plans/04-delta-snapshots.md names under "Manual snapshots and the whole-suite gate": test/helpers/IntegrationHelper.js's undoIt (and undoFit) currently treat every failed manual rollback as a silent skip (the `if (!rolledBack) return;` at roughly :274-277), and the plan says that leniency does not survive. Make a failed rollback fail the spec. The only legal skip is the existing null-snapshotId case (start-of-test snapshot taken outside the action phase). Scope fence: the harness only; do NOT build any delta-parity mode (that arrives with unit P4-F), do NOT touch production code except to fix a genuine engine defect this exposes, and if it exposes failing specs, fix or report them rather than re-adding leniency. Gate on `npm run test-parallel-undo` as the primary evidence. Do NOT run the performance capture; that belongs to unit P4-G. task_id: p4-1
```

### `P4-A` — Delta tracker + recording hooks

```bash
/orchestrate Implement docs/plans/04-delta-snapshots.md "Mechanism (adopted from -morph)" ONLY as far as the tracker and its hooks: a per-game delta tracker with startTracking/stopTracking/checkpoint/pending-window, recordFieldChange(gameObject, fieldName) called STRICTLY BEFORE the write in every retained decorator setter and every collection-wrapper mutator, first-write-wins with the `fieldName in goEntry` early return placed BEFORE any serializer lookup, and recordObjectCreation hooked in GameStateManager.register inside the `!_disableRegistration` guard. Scope fence: do NOT build chains, containers, cadence, bridges, eviction, the rollback protocol, memoization, or the Game.state promotion (units P4-B through P4-F); snapshots remain full and the restore path is untouched. The hook surface is larger than the plan lists: the seven decorators plus the P3-PB1 trio in server/game/core/GameObjectUtils.ts, UndoArray.push/unshift/pop/shift/reverse/splice, UndoMap.set/delete/clear, UndoSet.add/delete/clear, the UndoSafeRecord proxy traps, and ValueMap/ValueSet/ValueArray (whose mutators already carry `// Plan 4 hook point` comments). Two constraints P3-PB1 recorded: ValueMap/ValueSet mutators run inside super(entries) before private fields exist, so the hook body must not read #go/#prop as written - use a WeakMap keyed by this, a try/catch, or route population through .init() after an empty super(); and the #go/#prop fields on the Undo* wrappers are the hook data, do not delete them as dead code. Old values are captured through the StateEncoding per-field encoders (encodeStateValue, encodeRef, encodeRefArray, encodeRefMap, encodeRefSet, encodeRefRecord) selected by the registry entry's field kind, never by calling getObjectId(). Settle at the plan gate, not during implementation: the tracker is shared by both branches of the memoization-vs-deltas fork, and memoization (unit P4-C) consumes only the dirty (object, field) set, so decide whether pre-write value capture is always-on or a tracker mode, and state the hot-path cost either way. Also in scope: stop the tracker at the top of the shared rollback entry (SnapshotManager.rollbackToInternal) and restart it at its exit on both success and failure paths, and make SnapshotManager.clearAllSnapshots stop the tracker and discard its window, because MatchLoader calls it on a game that may be mid-window; startTracking asserts an anchor snapshot exists and is armed by the next SnapshotFactory.createSnapshotForCurrentTimepoint. Dedicated unit specs: mutate a scalar field 3x in one window and assert the recorded value is the window-start value; the same 3x test through each wrapper type including the three Value* wrappers; index assignment and `length =` documented as uninterceptable. Do NOT edit an existing benchmark scenario or redefine a headline benchmark. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P4-G. task_id: p4-a
```

### `P4-B` — `Game.state` as a GameObject

```bash
/orchestrate Implement the Game.state promotion from docs/plans/04-delta-snapshots.md "Mechanism" ONLY: make Game.state a real @registerState GameObject with alwaysTrackState = true so it flows through the same serializer, registry and tracking path as every other object, porting feature/quick-undo-deltas-morph's server/game/core/GameState.ts as the design reference. Unit P4-A has landed (the hooks exist); scope fence: do NOT build memoization, chains, cadence, or the rollback protocol (units P4-C through P4-F). Three things the plan's port note gets stale on: there is no v8.serialize(Game.state) left to remove (SnapshotFactory encodes it with encodeStateValue at roughly :151 and GameStateManager decodes it at roughly :258 - delete both in favor of the registry path); -morph's file predates the stateArray split and hand-rolls recordFieldChange in addWinnerName/incrementLastGameEventId/clearMovedCards, so winnerNames/allCards/movedCards become @stateArray fields and the manual hooks are NOT ported; the three player refs become @stateRef and the scalars @statePrimitive. This unit changes the snapshot format (IGameSnapshot.gameState goes away or becomes a uuid) and the rollback path (Game.state restores inside the ordinary update loop instead of being decoded first), so preserve P3-PB2's contracts: the restore must still deep-copy, never alias the retained record (ship the double-rollback spec with a game-level array mutation between the two rollbacks), and the pre-pass ordering must hold. This is also the unit that closes the schema-surface-hash gap P3-PB2 recorded in 03-codegen-serializers.md Phase B step 2 (Game.state was outside GENERATED_SCHEMA_SURFACE_HASH); verify the hash moves when an IGameState field is renamed, because Plan 6 work item D gates on that. Consumers to update, not break: MatchLoader's Game.state scalar restore and MatchSerializer's reads (Plan 2), the harness's game.state accesses, and every `this.state.` site in Game.ts. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P4-G. task_id: p4-b
```

### `P4-C` — Per-object serialization memoization

```bash
/orchestrate Implement the memoization stage of docs/plans/04-delta-snapshots.md "Decision checkpoint: full deltas vs per-object memoization" as a landed, gated state - NOT as a fallback sketch. Units P4-A and P4-B have landed. Keep full-snapshot semantics (every snapshot logically contains every object) and make GameStateManager.buildGameStateForSnapshot reuse each object's serialized record from the previous snapshot when the tracker reports it untouched since that snapshot, building a copy-on-write record map so unchanged records are shared by reference across retained snapshots. Scope fence: the restore path is unchanged; do NOT build chains, bridges, cadence, hollow snapshots, or the harness delta-parity mode (units P4-E and P4-F); do NOT decide the fork (unit P4-D does, on this unit's measured numbers). Three correctness rules: the cull (removeUnusedGameObjects) still runs first and a culled object's record is never reused; after any rollback the memo is reset to the restored snapshot's records (live state equals the snapshot by construction) and the tracker restarts, so nothing from the discarded timeline can be reused; a memoized record must be byte-equal to a fresh serialize - ship a parity spec that, in test mode, re-serializes every object and deep-compares against the memoized map at every snapshot point (the parity harness's compareSnapshotRecords is reusable). Settle at the plan gate, not during implementation: whether the P3-PB2 oldState pre-pass in rollbackToSnapshot may take the memoized record for objects clean since the current snapshot instead of re-serializing them, which is the same reuse and would remove most of the per-rollback serialize cost that pre-pass added. Gate: the full suite plus ENABLE_UNDO_ALL_TESTS=true (npm run test-parallel && npm run test-parallel-undo) plus the parity spec. Do NOT edit an existing benchmark scenario or redefine a headline benchmark. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P4-G, and the decision-gate interim capture belongs to unit P4-D. task_id: p4-c
```

### `P4-D` — Decision gate

```bash
/orchestrate Resolve docs/plans/04-delta-snapshots.md's "Decision checkpoint: full deltas vs per-object memoization" on evidence, now that units P4-A, P4-B and P4-C have landed. This unit is the ONE sanctioned interim benchmark run outside the plan's ⏱ unit: run `npm run benchmark -- --name after-plan-04-memo --compare after-plan-03` with ENABLE_PARITY_HARNESS unset, commit both generated files under docs/plans/performance/ with a README row that labels it decision-gate evidence rather than a plan capture, and write the verdict into the plan doc's decision-checkpoint section. Scope fence: no production code changes; do NOT begin units P4-E or P4-F; do NOT run the after-plan-04 capture, which belongs to unit P4-G - this unit's interim run is decision evidence only. The verdict rule, fixed here so it is not relitigated: read manager/moveToNextTimepoint(Action) avg and payload/retainedChain(13 snapshots) against after-plan-03, and check the sparsity test the plan names - forty-cards-four-mutated must improve markedly more than forty-cards-per-player. If memoization already delivers sparsity-scaled per-action cost AND a retained-chain reduction of the order the plan expected from deltas, the verdict is MEMOIZATION and P4-E/P4-F do not run; if either target is missed by a margin clearly outside the ~18-20% single-run noise floor docs/plans/performance/README.md records (replicate the row before concluding), the verdict is DELTAS and P4-E/P4-F run. Either way, record which payload rows changed meaning at P3-PB2 (payload/gameStateBuffer, payload/gameObjectStatesBuffer, payload/fullSnapshotTotal carry notes.measurement) and exclude them from the verdict. Also state whether the memoized pre-pass reuse P4-C settled changed rollback timing, since that decides how the plan's rollback-cost red flag is read at P4-G. task_id: p4-d
```

### `P4-E` — Delta chain in shadow mode *(conditional on `P4-D` = DELTAS)*

```bash
/orchestrate --tier 3 Implement docs/plans/04-delta-snapshots.md "Chain selection, contiguity, and eviction" and "Cadence" ONLY, in SHADOW MODE: deltas are recorded and chains are built, contiguity-checked and evicted at every rollback, but full snapshots are still taken at every timepoint and remain the only restore authority. Units P4-A through P4-D have landed and P4-D's verdict is DELTAS. Scope fence: do NOT apply a delta chain to live state, do NOT make any snapshot hollow, do NOT change manual-snapshot policy or the harness, do NOT touch the rollback protocol (all unit P4-F). In scope, each a deliberate correction to -morph that must survive review: the global id-ordered delta index with per-player DeltaSnapshotContainer entry points (mixed ordered list of {type:'full'} | {type:'delta'}; enforceMaxDeltaCount caps only action-delta entries at MaxDeltaEntries = 3 and never full entries); the contiguity assert at chain-build time - every id in (target, current] accounted for, any hole a SevereHaltGame-class failure, a missing target never a null no-op; the bridge shared-id rule (a bridge shares its boundary full snapshot's id and timepoint number, one timepoint two artifacts) with the universal pairing rule including zero-mutation bridges, so opponentActedSinceLastSnapshot's 0/1/2 classification stays byte-identical - ship the boundary-adjacent confirmation-policy spec; dispatch keyed on entry type only, never on index membership, with every ported deltaSnapshotsById.has(...) site audited; age eviction with the horizon rule and test-mode disable; shouldUseDelta (Action timepoints during the action phase only) and checkpointDelta with removeUnusedGameObjects run first at EVERY checkpoint; the delta payload shape carrying the first-removal full-record slot Plan 5 needs even though nothing populates it yet. The delta payload's old values are StateEncoding records (snapshots are already bufferless; the plan's buffer language is stale). Shadow-mode evidence: a test-mode check that, at every rollback, builds the chain for the rollback target and asserts contiguity, plus chain-math specs (multi-delta chain with both players acting crossing at least one bridge; corrupted chain with a deleted intermediate delta fails loudly; eviction advances the horizon with no holes). Do NOT edit an existing benchmark scenario or redefine a headline benchmark. Proof level: hardened. Do NOT run the performance capture; that belongs to unit P4-G. task_id: p4-e
```

### `P4-F` — The delta cutover *(conditional on `P4-D` = DELTAS)*

```bash
/orchestrate --tier 4 Implement docs/plans/04-delta-snapshots.md "Rollback protocol" and "Manual snapshots and the whole-suite gate" - the delta cutover. Proof level: hardened. Units P4-0, P4-1 and P4-A through P4-E have landed; the chain machinery exists in shadow mode. This is ATOMIC like P3-PB2: action-timepoint snapshots become hollow, the delta restore path, always-full manual snapshots with the anchor rule, and the harness delta-parity mode must land in one commit, because the harness IS the gate for the restore path and a hollow current snapshot cannot exist without the window-start materialization rule. Scope fence: do NOT touch Plan 5 work, do NOT port -morph's delta-backed manual snapshots, do NOT run the benchmark. All eight protocol steps hold, with three corrections against current main: (1) the shared stop/restart at rollbackToInternal already exists from P4-A - confirm it covers full rollbacks mid-action-phase, not only the delta path; (3) the pending-window delta is prepended only when a window is actually live, and the window data is INVALIDATED (not merely _tracking = false) once any non-delta path consumed or bypassed it; (4) the recovery snapshot need not be a second serialize - P3-PB2's oldState pre-pass already serializes every live object per rollback, so settle at the plan gate whether the recovery snapshot is assembled from that array; (5) apply newest-first restoring RNG and lastGameObjectId per delta, writing old values back through the StateEncoding field decoders via the accessor setters, tolerating already-culled createdObjectUuids; (6) reconcile the plan's pinned delta lifecycle order with main's current full order (deserialize+afterSetState per object, cleanupOnRemove, registry removal, afterSetAllState over every live object, restoreLastGameObjectId) and decide reconcileUpdatedCardZoneMemberships by MEASUREMENT on the delta path - P3-PA3's zero-violation evidence covers the full path only, so re-run its zone-membership counters under delta restore in the harness before porting or omitting it; (7) the hollow current snapshot's rngState/lastGameObjectId clone the post-restore live values or are nulled, never the target delta's window-start values; (8) restart covers success and failure. Registration during a delta rollback hard-fails through the existing _rollbackDepth guard - ship that spec, and note the companion case (registration inside a rehydration scope succeeds and rekeys) is Plan 5 unit P5A-2's, not yours. Manual snapshots: always full; materializing the hollow current snapshot produces the TRUE window-start state (serialize live, overlay the pending window's recorded old values per (uuid, field), drop pending createdObjectUuids, use the tracker's window-start rng/lastGameObjectId), consuming no id or timepoint; ship the mid-window manual-snapshot spec the -morph regression case misses. The gate: under ENABLE_UNDO_ALL_TESTS, index eviction is disabled, takeManualSnapshot also records a delta anchor, and undoIt rolls back through the delta chain then deep-compares the live serialization against the stored full manual snapshot (exclude chat, which the harness restores separately), failing the spec on any rollback failure other than the null-snapshotId skip P4-1 left in place. Also in scope: the snapshot-read save path Plan 6 B will add is named by the plan as a reader of current-snapshot metadata - leave a documented materialization entry point for it rather than a private one. Do NOT edit an existing benchmark scenario or redefine a headline benchmark, even though this unit changes what a snapshot is; the delta-specific rows are P4-G's as new rows. Do NOT run the performance capture; that belongs to unit P4-G. task_id: p4-f
```

### `P4-G` ⏱ — Spec sweep, diagnostic rows, capture and verdict

```bash
/orchestrate Close docs/plans/04-delta-snapshots.md. Which branch landed is recorded in the plan doc's decision-checkpoint section by unit P4-D: if MEMOIZATION, units P4-E/P4-F did not run and this unit's spec sweep covers memoization only; if DELTAS, P4-F has landed and the sweep is the plan's full "Verification" list minus what P4-E and P4-F already shipped. Scope fence: no new mechanism; specs, benchmark rows, capture and doc only. Dedicated specs still owed on the delta branch: rollback across a delta-to-full boundary; the same delta target twice with mutation in between; object created and destroyed within one window; the -morph SnapshotTypes.spec.ts regression case (delta-backed rollback then a manual snapshot, +43 lines, ported); full manual rollback mid-window then a delta checkpoint then a delta rollback asserting clean values; phase-boundary prompt cases under delta restore (P4-0's already-correct cases plus P4-0b's rule for the deferred case); eviction behavior end to end. Benchmark: add the delta-specific diagnostics (start-tracking cost, checkpoint cost, delta payload bytes and the delta SIZE distribution the plan's collection-copy caveat asks for) as NEW rows in the diagnostic tier, ported from the -morph branch's spec; do NOT repurpose or rename any existing row and do NOT edit an existing scenario. This is the FINAL unit of Plan 4 and the roadmap's performance deliverable: run `npm run benchmark -- --name after-plan-04 --compare pre-roadmap-baseline` with ENABLE_PARITY_HARNESS unset, also compare against after-plan-03 and after-plan-04-memo, commit both generated files under docs/plans/performance/ with a README row, and write the verdict into the plan doc's "Performance capture" section against the two things the roadmap set out to fix: speed (manager/moveToNextTimepoint(Action) and manager/rollbackTo(Manual), avg and p95) and memory/GC (payload/retainedChain(13 snapshots), allocation per operation, GC pause share in sustained/snapshotAndUndoCycle). State explicitly which rows are honest across the whole roadmap and which are not: payload/gameStateBuffer, payload/gameObjectStatesBuffer and payload/fullSnapshotTotal changed meaning at P3-PB2. Include anything that got worse, and read the rollbackTo(Manual) p95 red flag against after-plan-03 (rollback fell 44-60% there), not only the baseline. task_id: p4-g
```

---

## Plan 5 — GameObject Release & Recreation

Sixteen units across the plan's three stages: six in 5a, six in 5b, four in 5c. Each stage ends in its own ⏱ unit because the plan requires a capture per stage and each stage is separately landable. Hard dependencies carried into every fence: Plan 3 (landed), Plan 1 item B (landed at `5787a3314`, guard unconditional), and the Plan 4 coupling, whose delta stage is conditional — every fence that touches it names both cases.

### Decisions that shape the unit boundaries

**Plan 1 work item A landed option 1** (`aa95babf7`; ANVIL-LOG `P1-A`): the raw-value path reuses one `MutableOngoingEffectValueWrapper` per (effect, target) whose value lives in `@stateValue({ allowGenericValue: true }) _value`, guarded by `isSnapshotSafeOngoingEffectValue`, which now delegates to `encodeStateValue`. So stage 5b carries **no extra state-modelling work** for the wrapper family: the JSON-safe raw values are already in the record, and the wrapper's recipe reduces to its constructor arguments (`effectDescription`) plus the owning impl's coordinate. The immutable `OngoingEffectValueWrapper` (plain `value` field) and every wrapper subclass stay pinned exactly as the plan says. One correction from that log entry worth carrying: the plan's stated option-2 blocker did not bind (the client-state summary reads `targetStates` on the detached static wrapper, which neither option touches), so nothing downstream should cite it.

**A1 is smaller than written, A2 amends a guard that now exists.** `P3-PA1` already exported the two module-local classes, put the card-local classes in the registry, and made the generator hard-fail on new module-local targets; `P1-B` already added the mapping-occupancy hard-fail. What A1 still owns is the `classTag` in every record, factory entries, the synchronous card-data cache, and adding recipe-section field names to the schema-surface hash. What A2 owns is the scope mechanism and the **deliberate loosening** of `P1-B`'s unconditional guard to "registration outside an active rehydration scope hard-fails" — a unit whose purpose is to weaken a safety check another plan shipped tight, which is why it carries `--tier 3` and its invocation says so in those words.

**The inbound-pointer audit for the Card family is its own unit (`P5B-2`), not a bullet.** Cards are pinned by 5c policy and never released, but 5b's acceptance evicts token cards under fuzz, and rule A6 forbids a family entering the evictable set — even test-only — before its inbound plain-pointer audit is clean. For cards that surface is the largest in the engine (`PlayerOrCardAbility.card`, `OngoingEffect.source`/`matchTarget`, `CaptureZone.captor`, `UnitProperties.defaultAttackAction`, `Player.playableZones`, and whatever the sweep finds), so it is sized and reviewed on its own.

### Stage 5a — lifecycle infrastructure + leaf-family recreation

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P5A-1` | A1 — `classTag` in every record, factory registry entries, synchronous `id → ICardDataJson` cache, recipe-section names as a hash input | — | Medium 🟡 | full |
| `P5A-2` | A2 — rehydration scopes, scratch uuids, guard carve-out, match/rekey split, mid-throw recovery | `P5A-1` | Large 🔴 | `--tier 3` |
| `P5A-3` | A3 — restore order recreate → overlay → rehydrate, `onRehydrate()` hook, recreation-set determination | `P5A-2` | Large 🔴 | full |
| `P5A-4` | A5 — listener registration from state (registration records, handlers rebuilt in `onRehydrate`) | `P5A-3` for the hook; may plan concurrently with `P5A-2` | Medium 🟡 | full |
| `P5A-5` | A4 + A6 for leaf families — recipe sections (`max`, `currentUser`, `eventName`, metric config), the `ability ↔ limit` pointer conversion, stale-pointer detection (poison + `FinalizationRegistry`) | `P5A-3`, `P5A-4` | Medium 🔴 | full |
| `P5A-6` ⏱ | 5a acceptance — force-evict leaf specs, recreation-fuzz mode (leaf eligibility), registration-guard specs, `after-plan-05a` capture | `P5A-5` | Medium 🟡 | full |

#### `P5A-1` — Class tags, factory registry, card-data cache

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md stage 5a work item A1 (Class tags + factory registry) ONLY, minus the parts P3-PA1 already delivered. Already landed, to be consumed not rebuilt: the name-keyed registry in server/game/core/StateSerializers.ts with decorator/isAbstract/fields per entry; both formerly non-exported classes (FirstLightSmuggleAction, CustomDurationEvent) are exported; the generator hard-fails on a non-abstract module-local target (scripts/stateSerializerModel.js:200); the two card-local classes are registry entries. Scope fence: do NOT build rehydration scopes (P5A-2), the restore order (P5A-3), or any recipe section beyond the empty slot; do NOT touch Plan 4 or Plan 6 files. In scope: (1) every serialized record gains a stable classTag (the registry key) emitted by the generated serializer - this is a record-format change, so bump STATE_RECORD_FORMAT_VERSION in the same commit and note that Plan 4's memoized or delta records (whichever landed) carry it too; (2) the registry entry gains a factory slot `classTag -> (game, record, links) => instance`, populated in this unit for the 5a leaf families only (AbilityLimit variants, TrackedGameCardMetric) and left absent elsewhere, with StateSerializerCoverageCheck extended so every non-abstract registered class either has a factory or is explicitly listed as pinned - a class in neither set is a hard failure; (3) a game-lifetime synchronous id -> ICardDataJson cache populated at deck build (server/utils/deck/Deck.ts buildCardsFromSetCodeAsync, still async at :218) and token init (Game.initialiseTokens :1690), with the set-code/id persisted in each card's record - needed by 5b, built here because card construction is async and rollback is not; (4) computeSchemaSurfaceHash gains sorted recipe-section field names per class as an input, exactly as 03-codegen-serializers.md Phase A step 1 and 06-full-fidelity-save.md work item D specify - verify the hash is unchanged for classes with an empty recipe section and moves when one field is added. Settle at the plan gate, not during implementation: factories are hand-written per family and registered by classTag versus generator-emitted stubs - the plan says "extend the generated registry to also emit factory entries" but constructor signatures differ per family, so pick the shape and record why. Do NOT run the performance capture; that belongs to unit P5A-6. task_id: p5a-1
```

#### `P5A-2` — Rehydration scopes and the guard carve-out

```bash
/orchestrate --tier 3 Implement docs/plans/05-gameobject-recreation.md stage 5a work item A2 (Registration during rollback: the rehydration scope) ONLY. Proof level: hardened. Unit P5A-1 has landed. This unit DELIBERATELY LOOSENS a guard another plan shipped tight: Plan 1 work item B (5787a3314) made GameObjectBase registration during rollback an unconditional hard-fail via GameStateManager._rollbackDepth; the contract is amended here, not deleted, to "during rollback, any registration OUTSIDE an active rehydration scope hard-fails", and the P1-B spec text changes from "zero registrations" to "zero organic registrations". Say so in the commit and the log. Scope fence: do NOT implement the restore order or the recreation set (P5A-3), do NOT add recipe sections (P5A-5), do NOT touch release policy. In scope: beginRehydrationScope(record)/endRehydrationScope(), legal only while _rollbackDepth > 0 (Plan 6 work item C will add a load-mode gate later - leave the gate as a single predicate so that amendment is one line); scratch uuids from a reserved namespace that can never collide with a real uuid shape, collected into the scope and never inserted into the global containers, with _lastGameObjectId untouched by scope registrations; scope close as match -> rekey -> adopt with the MATCH step factored from the REKEY step so Plan 6's pairing mode can keep live uuids instead of adopting the record's; the rehydration-only uuid setter variant permitting exactly one scratch->real transition (GameObjectBase.ts:63-66 single-assignment assert); adoption under the EXISTING occupancy hard-fail at GameStateManager.ts:113-115 (extend it, do not duplicate it); unmatched collected objects discarded if !hasRef and a hard failure if hasRef; a post-close dev sweep asserting no scratch-shaped uuid appears in any scope object's serialized state; force-close with scratch discard on any throw so the existing recovery leg (GameStateManager.ts:303-322) handles partial recreation for free. Two premises to correct rather than carry: P1-B's uuid reproducibility is NOT exact (replayed ids are bounded within the freed window, offset +3 measured), so counter-neutrality is required for the window bound, not for exact reproduction; and the occupancy assert already exists. Specs: organic registration during rollback still hard-fails; registration inside a scope succeeds, matches, and is rekeyed; the occupancy assert fires on a manufactured collision; mid-rehydration throw leaves no scratch uuid in any mapping and no leaked registration. Plan 4 coupling: if unit P4-F landed, its "organic registration during a delta rollback asserts" spec gains its companion case here (registration inside a scope succeeds and rekeys); if P4-F did not land, note that the delta-rollback path opens no scopes and the guard stays total there. Do NOT run the performance capture; that belongs to unit P5A-6. task_id: p5a-2
```

#### `P5A-3` — Restore order: recreate → overlay → rehydrate

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md stage 5a work item A3 (Restore order: recreate -> overlay -> rehydrate) ONLY. Proof level: hardened. Units P5A-1 and P5A-2 have landed. Scope fence: do NOT add recipe sections or pointer conversions (P5A-5), do NOT implement listener registration from state (P5A-4) beyond declaring the hook, do NOT touch release policy. In scope, in GameStateManager.rollbackToSnapshot: (1) determine the recreation set - snapshot uuids with no live instance, treating a composite closure as one unit (the closure machinery itself is 5b; here the set is leaves only, and a snapshot uuid whose classTag has no factory is a hard failure, not a skip); (2) recreate in ascending numeric uuid order inside rehydration scopes, each running the real factory with constructor refs resolved through the registry, placed AFTER the P3-PB2 oldState pre-pass (GameStateManager.ts:213-252, which must see the pre-recreation population untouched) and BEFORE the restore try, so a throw during recreation leaves every pre-existing live object untouched; reserve deferred-link for genuine cycles only if one is hit; (3) scope close registers everything under original uuids; the Game.state container swap: if Plan 4 unit P4-B has landed, Game.state is a registry object restored in the ordinary loop and there is nothing to move, otherwise move the decode at :258 to after all scopes close and before any overlay; (4) deserialize state into every object, existing and recreated, through the accessor setters as today; (5) the new onRehydrate() lifecycle hook on GameObjectBase, symmetric to cleanupOnRemove, called for recreated objects before the existing afterSetState/afterSetAllState passes, with the lifecycle-order spec (test/server/core/RollbackLifecycleOrder.spec.ts or its successor) extended to pin its position. The oldState contract: a recreated object has no live pre-state, so define what its hooks receive (the plan is silent) and pin it. Specs: recreate a leaf whose factory exists, assert refs resolve and the object's serialized state equals its record; the mid-rehydration-throw recovery spec asserting pre-rollback state is restored, zero leaked registrations, no scratch uuids in any mapping. Do NOT run the performance capture; that belongs to unit P5A-6. task_id: p5a-3
```

#### `P5A-4` — Listener registration from state

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md stage 5a work item A5 (Listener registration from state) ONLY. Unit P5A-3 has landed the onRehydrate hook. Scope fence: do NOT touch scopes, recipe sections, pointer audits, or release policy; do NOT change which events any ability registers for. Generalize the isRegistered pattern across the five per-object holders that register raw closures on Game and unregister by function identity (TriggeredAbility, StateWatcher, CustomDurationEvent, RepeatableAbilityLimit, EventRegistrar users; the sixth game.on site in UnitProperties is a static rules registration and is out of scope): registration state (which events, active or not) lives in decorated state, handlers are rebuilt in onRehydrate, and unregistration goes by registration record rather than raw function identity, so a recreated object can unregister listeners it did not originally register. This closes the STATE TODOs at Card.ts:1186 and TriggeredAbility.ts:237 ("aggregateWhen is readonly, which means we can reliably recreate the eventRegistrations array"); the separate trigger-removal lifecycle TODO at TriggeredAbility.ts:296 is NOT this work item. Constraint from P3-PB2: afterSetState overrides must mutate only `this` (the pre-pass manufactures every oldState before any restore), so the rebuilt-handler path must not write another object's decorated field. Specs: a recreated RepeatableAbilityLimit's listeners fire; a rolled-back-then-recreated TriggeredAbility does not leak a duplicate Game listener (count listeners before and after). Do NOT run the performance capture; that belongs to unit P5A-6. task_id: p5a-4
```

#### `P5A-5` — Leaf recipes, the ability↔limit pointer conversion, stale-pointer detection

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md stage 5a work items A4 (Recipe data: the non-state constructor-config audit) and A6 (Inbound-pointer rule) for the LEAF FAMILIES ONLY - AbilityLimit variants and TrackedGameCardMetric - plus the stale-pointer detection mechanism 5a's acceptance names. Proof level: hardened. Units P5A-1 through P5A-4 have landed. Scope fence: do NOT audit or convert pointers for cards, effects, or any composite family (unit P5B-2); do NOT enable eviction for any non-leaf family; do NOT touch release policy. A4: for every leaf family, audit non-state constructor config - PerGameAbilityLimit.max (:106) and currentUser (:105), PerPlayerPerGameAbilityLimitBase.max (:142), RepeatableAbilityLimit.eventName (:194), TrackedGameCardMetric's config - and for each field either decorate it or emit it in the per-class recipe section the generated serializer now carries (JSON-safe values only), including the family's stable matching coordinate (for a limit: its owning ability's coordinate plus role 'limit'); the recipe section is a schema-surface-hash input per P5A-1, so the hash moves here and that is expected. A6: convert the ability <-> limit link in both directions (PlayerOrCardAbility.limit at :50, AbilityLimit.ability at :25) to decorated refs or onRehydrate re-derivation, and demonstrate with the detector below that no other live plain pointer targets a leaf-family instance. Detection: in test mode, evicting or releasing an instance poisons it (a _released flag asserted in hot GameObjectBase entry points such as getObjectId) and registers it with a FinalizationRegistry; a spec asserts the old instance is never touched again AND becomes collectable, which is what catches split-brain that an assert-on-the-new-instance test cannot. Do NOT run the performance capture; that belongs to unit P5A-6. task_id: p5a-5
```

#### `P5A-6` ⏱ — 5a acceptance and capture

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md "5a acceptance" ONLY. Units P5A-1 through P5A-5 have landed. Scope fence: no new mechanism; specs, the fuzz mode, and the capture. Deliver: force-evict specs for a PerGameAbilityLimit with a non-default max, a RepeatableAbilityLimit with registered listeners, and a TrackedGameCardMetric - roll back, assert recreation with identical serialized state (deep-compare recreated vs pre-eviction record), working refs, functioning listeners, and correct recipe fields; the "recreation fuzz" mode in the undo harness (ENABLE_UNDO_ALL_TESTS) that randomly evicts eligible objects before each rollback, with eligibility computed from per-family flags and restricted here to standalone-factory leaves, the stale-pointer poison and FinalizationRegistry checks active, and recreated objects' serialized state deep-compared against their pre-eviction records; the registration-guard spec set (organic registration during rollback hard-fails; scope registration succeeds and rekeys; occupancy assert fires) if P5A-2 did not already ship all three; full suite plus ENABLE_UNDO_ALL_TESTS=true green with recreation active for the leaf families. Plan 4 coupling: if unit P4-F landed, the fuzz eviction must run only at full-snapshot boundaries and the delta chain must still replay cleanly across an evicted-and-recreated leaf; if it did not, say so. This is the FINAL unit of stage 5a: run `npm run benchmark -- --name after-plan-05a --compare pre-roadmap-baseline` with ENABLE_PARITY_HARNESS unset and the fuzz mode off, also compare against after-plan-04, commit both generated files under docs/plans/performance/ with a README row, and note in the plan doc that 5a is expected to be performance-neutral - a regression here is pure overhead and needs an explanation, not a wave-through. task_id: p5a-6
```

### Stage 5b — composite recreation and closure recipes

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P5B-1` | The composite protocol for cards and tokens: fan-out collection, matching coordinates, ordinal-within-scope, eviction-unit atomicity, dev-asserts; cards evictable only behind a test flag until `P5B-2` | `P5A-6` | Large 🔴 | `--tier 4` |
| `P5B-2` | A6 for the Card family and its fan-out: the inbound plain-pointer audit and conversion; flips the card eviction flag on in test mode | `P5B-1` | Large 🔴 | full |
| `P5B-3` | Gained-ability recipe + the per-grant identifier fix (recorded at grant time, never re-derived from `nextAbilityIdx`) | `P5B-2` | Medium 🔴 | full |
| `P5B-4` | Constant-ability `OngoingEffect` recipe, `DynamicOngoingEffectImpl` and `MutableOngoingEffectValueWrapper` recipes, family flags, pinned classification for lasting effects, `CustomDurationEvent`, and all wrapper subclasses | `P5B-2` | Large 🔴 | full |
| `P5B-5` | The snapshot-time classification dev-assert (recreatable / pinned / recreatable-by-capture placeholder) with its falsifier | `P5B-3`, `P5B-4` | Medium 🟡 | full |
| `P5B-6` ⏱ | 5b acceptance — fuzz over composites, the targeted specs, `after-plan-05b` capture | `P5B-5` | Medium 🟡 | full |

`P5B-3` and `P5B-4` are independent of each other and may run concurrently after `P5B-2`.

#### `P5B-1` — The composite protocol

```bash
/orchestrate --tier 4 Implement docs/plans/05-gameobject-recreation.md stage 5b "The composite protocol (cards and tokens)" and "Eviction unit (decided)" ONLY. Proof level: hardened. All of stage 5a has landed (scopes, restore order, onRehydrate, leaf recipes, the card-data cache from P5A-1). Scope fence: do NOT audit or convert the Card family's inbound plain pointers (unit P5B-2) - until that unit lands, cards and tokens enter the evictable set only behind a test-only flag that is OFF by default, because rule A6 forbids a family being evictable before its pointer audit is clean; do NOT build gained-ability, effect, or wrapper recipes (P5B-3, P5B-4); do NOT touch release policy. The mechanism: run the real card constructor inside a rehydration scope, using the synchronous card-data cache (card construction is otherwise async - Deck.ts:218); the scope collects the card and everything its constructor chain and setupCardAbilities/setupStateWatchers registered; match each collected object to a record by the per-family coordinate table - root by construction, printed abilities by abilityIdentifier (internalName_type_idx, Card.ts:566-573, with nextAbilityIdx at :327 overlaid AFTER matching), limits by (owning ability coordinate, role 'limit') with classTag agreement, state watchers resolved to the existing pinned singletons through StateWatcherRegistrar's idempotent registerWatcher (verify the dedupe path holds during rehydration), everything else by (classTag, ordinal-within-scope) recorded at original construction in the record's recipe section; rekey; overlay. Dev-assert collected count, classTag sequence, and coordinate collisions as hard failures, never best-effort. Fan-out membership is recorded at construction time and persisted with the root's record; eviction is atomic at exactly two granularities (leaf, or composite closure) and both partial directions are excluded by construction - ship specs that demonstrate each partial direction fails loudly (child evicted under a live root, root evicted under live children). Ship the plan's uuid walk-through as a spec: a TriggeredAbility at PlayerOrCardAbility_57 in the snapshot re-registers as a scratch uuid and answers to _57 after scope close, _lastGameObjectId never moves, and no _212-style id is minted. InitiateAttackAction (UnitProperties.ts:347, constructed before initialize() runs) is the canonical no-semantic-identifier fan-out member - cover it. Plan 4 coupling: if unit P4-F landed, a composite removed within a delta window must be recreatable from the first-removal full-record slot P4-E reserved - populate that slot here for composites and say so; if P4-F did not land, leave the slot unpopulated and note it. Do NOT run the performance capture; that belongs to unit P5B-6. task_id: p5b-1
```

#### `P5B-2` — Inbound-pointer audit for the Card family

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md rule A6 (Inbound-pointer rule) for the CARD family and its constructor fan-out, so cards and tokens can enter the evictable set the way stage 5b's acceptance requires. Proof level: hardened. Unit P5B-1 has landed the composite protocol with card eviction behind a test-only flag. Scope fence: this is an audit-and-convert unit; do NOT build recipes (P5B-3, P5B-4), do NOT touch release policy, and do NOT release anything - cards stay pinned by 5c's family policy, this audit exists because fuzz eviction under test recreates them. The plan's named surface is the starting list, not the inventory: Player.playableZones (Player.ts:757, STATE note), ZoneAbstract owner links, PlayerOrCardAbility.card and .properties (:50 and the props bag), OngoingEffect.source/.impl/.matchTarget/.ongoingEffect (OngoingEffect.ts:44-53, readonly plain fields), CaptureZone.captor (CaptureZone.ts:18, its own STATE TODO), UnitProperties.defaultAttackAction (:167, constructed at :347), the ability <-> limit link (done in P5A-5), plus a sweep for others (Attack.previousAttack and GameEvent chains pin cards indirectly - transient, but verify). Produce the inventory first, then for every live pointer to a Card or fan-out instance either convert it to a decorated state ref or re-derive it in onRehydrate; the proof of completeness is the stale-pointer detector from P5A-5 running clean across the whole undo suite with the card eviction flag ON in test mode, which this unit flips on. Any pointer that cannot be converted is a hard block, not a residual - report it and stop. Do NOT run the performance capture; that belongs to unit P5B-6. task_id: p5b-2
```

#### `P5B-3` — Gained-ability recipe and identifier fix

```bash
/orchestrate Implement the "Gained abilities" recipe from docs/plans/05-gameobject-recreation.md stage 5b "Closure-bearing families" ONLY. Proof level: hardened. Units P5B-1 and P5B-2 have landed. Scope fence: do NOT touch constant-ability effects, wrappers, CustomDurationEvent, or the classification assert (P5B-4, P5B-5); do NOT touch release policy. Two mandatory pieces: (1) fix the gained-ability identifier scheme first - GainAbility._abilityUuidByTargetCard (GainAbility.ts:20, now @stateMap) records grants by runtime uuid with an admitted collision TODO; the per-grant identifier must be unique per grant instance and RECORDED IN THE SNAPSHOT RECORD AT GRANT TIME, never re-derived from the target card's nextAbilityIdx at re-grant time, because that counter holds a fresh-construction or live post-timeline value during rollback; (2) the recipe (sourceCardRef, sourceAbilityCoordinate, targetCardRef, gainKind) with recreation re-deriving props from the source card's definition and re-applying the grant, under the mandatory re-grant-then-overlay ordering (A3 step 4 overlays nextAbilityIdx AFTER the re-grant mutates it). Plan 2 coupling: EngineOnlyFacts.ts already classifies gained abilities for the semantic-tier manifest and Plan 6 reuses this recipe for its round-trip wiring - keep the recipe's coordinate JSON-safe and stable (invariant 2), never uuid-based. Specs: rollback recreates a card with an active gained ability and the ability still fires; two grants of the same source ability to different targets get distinct identifiers; a grant re-derived after a rollback does not consume a fresh nextAbilityIdx. Do NOT run the performance capture; that belongs to unit P5B-6. task_id: p5b-3
```

#### `P5B-4` — Effect, impl and wrapper recipes; pinned families

```bash
/orchestrate Implement the OngoingEffect, OngoingEffectValueWrapper and CustomDurationEvent entries of docs/plans/05-gameobject-recreation.md stage 5b "Closure-bearing families" ONLY, including their pinned classifications. Proof level: hardened. Units P5B-1 and P5B-2 have landed; P5B-3 may be in flight (independent). Scope fence: do NOT build the snapshot-time classification dev-assert itself (P5B-5) - this unit produces the per-family flags it consumes; do NOT touch release policy; do NOT attempt lasting-effect parameter capture or the CustomDurationEvent recreation recipe, both of which Plan 6 work item A owns explicitly. Sub-family (a), constant-ability effects from persistent()/whileSourceInPlay (OngoingEffectSource.ts): recreatable via source card plus an effect coordinate minted at registration (internalName_kind_idx, the abilities pattern), re-running the propertyFactory from the source card's definition, with DynamicOngoingEffectImpl riding along; the plain readonly fields on OngoingEffect (source, matchTarget, duration, until, condition, sourceZoneFilter, impl, ongoingEffect at OngoingEffect.ts:44-53) are re-derived, never serialized. Sub-family (b), resolution-created lasting effects: NON-RECREATABLE, PINNED, and CustomDurationEvent (OngoingEffectEngine.ts:193, plain name/handler/effect fields) is pinned with its effect - every Duration.Custom producer is resolution-created (GiveInToYourAnger.ts:24, Clone.ts:32, FivesIHaveProof.ts:30 are the only card sites; DelayedEffectSystem forbids Custom). Wrappers: Plan 1A landed OPTION 1, so MutableOngoingEffectValueWrapper._value is already decorated and JSON-safe by construction; its recipe is the owning impl's coordinate plus effectDescription and it is recreatable; the immutable OngoingEffectValueWrapper (plain value field, OngoingEffectValueWrapper.ts:11), GainAbility, AdditionalPhaseEffect, GainKeyword, CloneUnitEffect, CopyStandardTriggeredAbilitiesEffect, GainNonKeywordAbilitiesFromUnitEffect, Restriction and UnitsEnterPlayReadyForPlayer are pinned by family flag. Every family gets an explicit flag in one place (recreatable | pinned), and the flag table is the input to P5B-5's assert. Specs: rollback recreates a constant-ability effect with a dynamic value end to end; a pinned custom-duration effect and its CustomDurationEvents survive a rollback in which other families are evicted and still fire afterwards. Do NOT run the performance capture; that belongs to unit P5B-6. task_id: p5b-4
```

#### `P5B-5` — The classification dev-assert

```bash
/orchestrate Implement the "Assert the whole classification rather than assume it" check from docs/plans/05-gameobject-recreation.md stage 5b ONLY: a dev-mode check at snapshot time that walks live tracked objects and hard-fails if any object's family is not in a recognized class. Units P5B-3 and P5B-4 have landed and produced the family flag table. Scope fence: no new recipes, no release policy. The recognized classes are three - recreatable, pinned, and recreatable-by-capture - where the third is a PLACEHOLDER this unit defines but nothing populates: Plan 6 work item A registers captured lasting effects under it, and in-memory rollback must treat that class exactly as pinned. The check must cover CustomDurationEvent explicitly (pinned-with-its-effect). Acceptance requires the falsifier: force-mark a resolution-created lasting effect as recreatable and demonstrate the check goes red, then revert; a green check that cannot go red proves nothing (P3-PA4 and P3-PB2 both had to relearn this). Wire it to run at every snapshot point under the undo harness and at dev startup boot the way StateSerializerCoverageCheck does. Do NOT run the performance capture; that belongs to unit P5B-6. task_id: p5b-5
```

#### `P5B-6` ⏱ — 5b acceptance and capture

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md "5b acceptance" ONLY. Units P5B-1 through P5B-5 have landed. Scope fence: no new mechanism; specs, the fuzz extension, and the capture. Extend the recreation-fuzz mode from P5A-6 to composites: eligibility is per-family flags plus the eviction-unit rule (a composite is eligible only as a whole closure, fan-out members never individually), with the stale-pointer poison and FinalizationRegistry checks active and recreation parity deep-compared. Targeted specs still owed after P5B-1 through P5B-4: rollback recreates an evicted token card end to end with fan-out matched and stale-pointer detection clean; the classification assert covers CustomDurationEvent and fails when a lasting effect is force-marked recreatable (re-run P5B-5's falsifier as a spec if it was inspection-only). Gate: undo-all-tests green with recreation enabled for cards, tokens, and every recipe family, in fuzz mode. Plan 4 coupling: if unit P4-F landed, fuzz eviction runs only at full-snapshot boundaries and a composite removed within a delta window must recreate from P4-E's first-removal slot. This is the FINAL unit of stage 5b: run `npm run benchmark -- --name after-plan-05b --compare pre-roadmap-baseline` with ENABLE_PARITY_HARNESS unset and fuzz mode off, also compare against after-plan-05a, commit both generated files under docs/plans/performance/ with a README row, and note that 5b is expected to be performance-neutral except for recipe sections adding bytes per record - quantify that in payload/fullSnapshotTotal and bytes-per-GameObject rather than waving it through. task_id: p5b-6
```

### Stage 5c — release policy

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P5C-1` | Ref extractors for uuid-bearing `stateValue`/`stateMap` payloads, shaped extract-and-rewrite, with the dev deep-scan and its falsifier | `P5A-6` (may run concurrently with 5b) | Medium 🟡 | full |
| `P5C-2` | The retained reference set and per-uuid liveness replacing the monotonic `hasRef` latch; the two-tier release criterion | `P5B-6`, `P5C-1` | Large 🔴 | `--tier 3` |
| `P5C-3` | Release mechanism, `afterTakeSnapshot` sweep wiring at full-snapshot boundaries, family policy, tier-2 manual-snapshot release | `P5C-2` | Large 🔴 | full |
| `P5C-4` ⏱ | 5c acceptance — long-game instrumentation (new scenario, not an edited one), released-uuid scan, tier-2 manual-restore spec, `after-plan-05c` capture | `P5C-3` | Medium 🟡 | full |

#### `P5C-1` — Ref extractors and the deep scan

```bash
/orchestrate Implement the "Liveness must see uuids inside stateValue payloads" work item of docs/plans/05-gameobject-recreation.md stage 5c ONLY. Stage 5a has landed; this unit depends on nothing in 5b and may run alongside it. Scope fence: do NOT build the liveness tracker, the release criterion, or the sweep (P5C-2, P5C-3). Inventory every uuid-bearing non-ref state field - the decorated-field list is enumerable from the generated registry's fields[] of kind 'value': GainAbility._abilityUuidByTargetCard (:20, @stateMap, a Map<string, string> of target uuid to gained-ability uuid), GainNonKeywordAbilitiesFromUnitEffect's three uuid maps, StateWatcher.entries (arbitrary TState[] carrying GameObjectId strings), and anything else the inventory finds - and for each either migrate it to a real ref decorator or register a per-field ref extractor. Shape the extractor interface as EXTRACT-AND-REWRITE, not extract-only: Plan 6 work item C reuses these same extractors to rewrite uuids inside opaque payloads through its load-time translation table, so an extractor must be able to return a payload with every uuid mapped through a supplied function. Enforce completeness with a dev-mode deep scan for uuid-shaped strings in every serialized record at snapshot time in tests, hard-failing on any uuid an extractor did not report; acceptance requires demonstrating the scan goes red when one extractor is removed. Note the optional cheapening the plan names - branding GameObjectId strings in the encoders - is a Plan 3 encoder change and is out of scope unless the plan gate decides it is the cheaper complete answer. Do NOT run the performance capture; that belongs to unit P5C-4. task_id: p5c-1
```

#### `P5C-2` — Liveness replaces the latch

```bash
/orchestrate --tier 3 Implement the "Define the retained reference set precisely" and "Two-tier release criterion" work items of docs/plans/05-gameobject-recreation.md stage 5c ONLY. Proof level: hardened. Units P5B-6 and P5C-1 have landed. Scope fence: do NOT implement the release mechanism, the sweep wiring, or the family policy (P5C-3); this unit builds the liveness answer, not the act of releasing. Replace the monotonic _hasRef latch (GameObjectBase.ts:37, :52-55; latched by every markStateRef* call in GameObjectUtils.ts) with per-uuid liveness computed from the retained reference set, defined as the union of: (i) full-snapshot records in every retention window (action containers, phase containers); (ii) Plan 4's structures IF unit P4-F landed - recorded old values in the global delta index, the pending live-tracker window, and any hollow current snapshot's materialization sources - and if P4-F did not land, the memoized record map of P4-C, which shares records across snapshots and must be counted once per retained snapshot that references it; (iii) manual snapshots. Uuids inside opaque payloads come from P5C-1's extractors. Two tiers: tier 1, releasable when in no part of the retained set and held by no live hard reference, needing no recreation story - this is where the memory claim lives; tier 2, recreatable families (5a leaves, 5b recipe families, never Cards) additionally releasable while referenced only by manual snapshots. Never release anything referenced by a quick or delta window regardless of tier. alwaysTrackState governs snapshot inclusion, not release policy. Name and close the P1-B hazard: removeUnusedGameObjects drops still-alive ref-less objects while a replayed object can take the freed id - under liveness, define what "ref-less at snapshot time" means so that cull and release agree, and ship a spec for the case. Do NOT run the performance capture; that belongs to unit P5C-4. task_id: p5c-2
```

#### `P5C-3` — Release, sweep wiring, family policy

```bash
/orchestrate Implement the "Release = unregister + cleanupOnRemove", "Sweep wiring" and "Family policy, reconciled" work items of docs/plans/05-gameobject-recreation.md stage 5c ONLY. Proof level: hardened. Unit P5C-2 has landed. Scope fence: do NOT change the liveness definition (P5C-2); do NOT revisit card/token release, which the plan defers indefinitely by decision; do NOT add benchmark scenarios (P5C-4). Release = unregister listeners (P5A-4's registration records) + cleanupOnRemove + drop from both registry containers, and in test mode poison + FinalizationRegistry-track via P5A-5's detector; the instance becomes GC-able. Wire GameStateManager.afterTakeSnapshot (:394-397, a dead private stub with no caller) into the snapshot path and define its interaction with the pre-serialize removeUnusedGameObjects() (:140-158, called at :181 and SnapshotManager.ts:118). Plan 4 coupling: if unit P4-F landed, sweep ONLY at full-snapshot boundaries, never per action delta - a mid-chain sweep races the delta window's recorded values, and criterion (ii) is the backstop, not the mechanism; if P4-F did not land, every timepoint is a full-snapshot boundary and the sweep runs at each. Family policy: pinned by policy - Player, Zones, engine singletons, state watchers, all Cards including tokens; release targets - superseded value wrappers, expired effects plus their impls and CustomDurationEvents, removed gained-ability objects and their limits; per-family release enablement gated on that family's A6 audit being clean (5a's leaves and 5b's recipe families are). Tier-2 release for recipe families referenced only by manual snapshots, with a manual restore recreating them. Ship the spec: a released tier-1 object's uuid appears nowhere in any retained structure (assert by scan), and the stale-pointer detector is clean across the whole undo suite with release enabled. Do NOT run the performance capture; that belongs to unit P5C-4. task_id: p5c-3
```

#### `P5C-4` ⏱ — 5c acceptance, instrumentation and capture

```bash
/orchestrate Implement docs/plans/05-gameobject-recreation.md "5c acceptance" ONLY. Units P5C-1 through P5C-3 have landed. Scope fence: no new mechanism; specs, instrumentation, and the capture. Deliver: the tier-2 spec (an object created, referenced, expired, aged out of all quick windows but still referenced by a manual snapshot is released and then recreated correctly when that manual snapshot is restored); the released-uuid-nowhere scan spec if P5C-3 shipped it as inspection only; the ref-extractor deep-scan falsifier re-run as a spec; stale-pointer detection clean across the whole undo-all-tests run with release enabled; and the long-game instrumentation - retained-card count and total retained-object count over a long game, the measurement that gates any future card/token-release follow-up. The existing benchmark scenarios set up a board and mutate it in place and do not play a long game, so if the release benefit does not show in them, ADD a new long-game scenario and new diagnostic rows rather than editing an existing scenario or redefining a headline row; state in the plan doc whether the harness or the change is the limitation. This is the FINAL unit of stage 5c and of Plan 5: run `npm run benchmark -- --name after-plan-05c --compare pre-roadmap-baseline` with ENABLE_PARITY_HARNESS unset and release enabled, also compare against after-plan-05b and after-plan-04, commit both generated files under docs/plans/performance/ with a README row, and write into the plan doc the bounded-GameObject-count claim as measured (the live GameObjects count per scenario, then payload/fullSnapshotTotal and payload/retainedChain, and the standalone bytes-per-Card number), watching manager/rollbackTo(Manual) for the new recreate-during-rollback cost. task_id: p5c-4
```

---

## Plan 6 — Full-Fidelity Save/Load

Eight units. Work item G runs early and independently; A is whole (stage 5b discharged none of it); C is split into matching (`P6-C1`) and construction-plus-rewrite (`P6-C2`); E shrank to documentation and is folded into the closing unit; the residue is measured by extending the Plan 2 degradation tool, never asserted.

### Decisions that shape the unit boundaries

**Work item A is not partially discharged by 5b.** Stage 5b classifies resolution-created lasting effects as pinned and defers both the parameter capture and the `CustomDurationEvent` recipe to Plan 6 A by name; `P5B-4` above does exactly that. What 5b does hand over is the interface: the "recreatable by capture" class in `P5B-5`'s assert, the recipe-section slot in every record from `P5A-1`, and `P5B-3`'s gained-ability recipe and `P5B-4`'s constant-ability recipe, which A's "same treatment, briefly" paragraph says need only round-trip wiring. A is therefore sized Large and split by side: `P6-A1` is the capture (writer side, measurable on its own through the degradation tool), and re-application lives in `P6-C2` where the loader constructs file-only records, because in-memory rollback never exercises it.

**Work item G is split, and its first half runs early.** The `until`-closure refactor to a declarative form compiled to provenance-tagged functions is engine plus three card files and depends on nothing in Plans 4 or 5, so `P6-G` can run any time, including now. Its second bullet — applying A's identity-plus-re-derive recipe to the Clone and Fives parameter bags — needs A's capture shape and lands with `P6-C2`.

**The residue is measured, not asserted.** `P2-E` left `npm run measure-degradation` (6,128 boards; 9.9% degrade at that time, by category). `P6-A1` extends the probe to report capture residue per card, `P6-B1` re-runs it so the manifest counts become the engine-minus-semantic difference, and `P6-F`'s round-trip corpus is the final oracle. A residue that is "expected empty" is a number in a report, not a sentence in a doc.

**`P6-D` depends on Plan 4's `P4-B`.** The schema-surface hash does not cover `Game.state` until `Game.state` is a registry object; gating engine-tier compatibility on the hash before then would accept a save whose `IGameState` shape changed. `P5A-1` supplies the other missing input (recipe-section field names).

### Unit table

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P6-G` | G (first half) — declarative `until` form compiled to provenance-tagged functions; the three card files converted with behavior specs unchanged | — | Small 🟡 | `--fast` |
| `P6-A1` | A — lasting-effect parameter capture at write time, capturability dev-assert, writer hard-fail naming the card, the "recreatable by capture" class, the `CustomDurationEvent` recipe seam; residue made measurable | `P5B-6`, `P6-G` | Large 🔴 | full |
| `P6-B1` | B (writer) — live-reachable record set, in-record layout, file-level JSON hardening, manifest repurposed, cross-tier validation | `P6-A1`, `P5C-1` | Large 🔴 | full |
| `P6-C1` | C (matching) — fresh game without injection, stable-coordinate matching, disposition table, translation table, load-mode gate for scopes in pairing mode | `P6-B1`, `P5A-2`, `P5B-1` | Large 🔴 | `--tier 4` |
| `P6-C2` | C (construction + rewrite) — file-only records constructed from recipes including A's captures, ref rewrite through extractors, apply/link/rehydrate, `_lastAttackId` restore, the Clone/Fives identity recipe (G's second half) | `P6-C1`, `P5B-3`, `P5B-4`, `P5C-1` | Large 🔴 | `--tier 3` |
| `P6-B2` | B (error-path saves) — snapshot-read engine-tier-only save from the last action snapshot for `Lobby.handleError` / `handleSerializationFailure` | `P6-B1`, `P4-F` (if it landed) | Medium 🔴 | full |
| `P6-D` | D — `formatVersion` 2 + migration chain, schema-hash gate, card-data-version policy, degradation protocol, no aliasing layer | `P6-C2`, `P4-B`, `P5A-1` | Medium 🔴 | full |
| `P6-F` ⏱ | Verification corpus, uuid-renumbering fuzz, continuation, measurement (F), hidden-information docs (E), `final-performance` capture | `P6-D`, `P6-B2` | Large 🟡 | full |

### `P6-G` — The `until`-closure refactor

```bash
/orchestrate --fast Implement the FIRST half of docs/plans/06-full-fidelity-save.md work item G (Empty the residue: refactor the three until-closure card files) ONLY: convert server/game/cards/03_TWI/units/Clone.ts, server/game/cards/07_TS26/units/FivesIHaveProof.ts and server/game/cards/02_SHD/events/GiveInToYourAnger.ts from per-resolution `until` closures to a declarative, serializable until-condition form (event name plus a coordinate-expressible predicate such as "the effect's own source or target leaves play"), and define the engine-side contract that makes it capturable: the engine consumes `until` as functions (Object.keys(effect.until) at OngoingEffectEngine.ts:527, listener(event, context) at :553-554), so the declarative form is COMPILED to functions that carry their declarative source as recorded provenance. Scope fence: do NOT implement the capture itself, the writer hard-fail, or the identity-plus-re-derive recipe for the Clone/Fives parameter bags (the second half of G, which needs work item A's capture shape and lands with unit P6-C2); do NOT touch any other card. This unit depends on nothing in Plans 4 or 5 and may run at any time. The three cards' behavior specs must pass unchanged; add the developer-docs style rule that card implementers write until conditions in the declarative form. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-g
```

### `P6-A1` — Lasting-effect parameter capture

```bash
/orchestrate Implement docs/plans/06-full-fidelity-save.md work item A (Prerequisite: lasting-effect parameter capture) ONLY on the CAPTURE side; re-application is unit P6-C2's. Proof level: hardened. Plan 5 stages 5a and 5b have landed (recipe sections in every record, the pinned classification for resolution-created lasting effects, the "recreatable by capture" placeholder class in the snapshot-time assert, the gained-ability and constant-ability recipes) and unit P6-G has landed the provenance-tagged declarative until form. Scope fence: do NOT write the engine-tier writer (P6-B1), do NOT build any loader piece, do NOT touch the three until card files beyond consuming their provenance. Capture point is lazy, at write time (decided): read the fields OngoingEffect already holds as plain readonly members (OngoingEffect.ts:44-53 - matchTarget, duration, until, the props bag, effect.context.ability) into the effect's record recipe section as a resolved matchTarget ref, duration, the source ability's coordinate defined over the statically declared registration site (abilityIdentifier plus which lasting-effect invocation within that ability, dev-asserted deterministic - it cannot point into a live GameSystem tree, which is outside the GameObject graph and re-minted per generatePropertiesFromContext call), and the resolved additional-properties bag; nothing walks the bag on the resolution hot path, the registration-time capturability check is a test-mode dev-assert, and the HARD-FAIL on a non-capturable member fires in the writer naming the card. Residue rule: any captured member that is neither JSON-safe nor ref-encodable; function-valued until members are exempt only when provenance-tagged. The CustomDurationEvent recipe (Plan 5 deferred it here) needs the event's registration and cancellation state, not just the handler, and createCustomDurationHandler is private (OngoingEffectEngine.ts:550) - re-derivation goes through a deliberate seam, not a reach-in. Register captured effects under the "recreatable by capture" class so P5B-5's assert accepts them; in-memory rollback keeps treating them as pinned. Make the residue MEASURABLE: extend test/helpers/SaveDegradationProbe.js and scripts/measure-save-degradation.js to report, per board, every effect whose capture hard-fails and the card that owns it, and record the first number in the plan doc; also look at the one `clone` nextAbilityIdx coordinate-drift refusal P2-E left open, since it is the same card family. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-a1
```

### `P6-B1` — Writer: the engine tier

```bash
/orchestrate Implement docs/plans/06-full-fidelity-save.md work item B (Writer: emit the engine tier) ONLY, EXCLUDING the snapshot-buffer read path for error-path saves (unit P6-B2). Proof level: hardened. Unit P6-A1 has landed the capture recipes and Plan 5 unit P5C-1 has landed the ref extractors. Scope fence: do NOT build any loader piece (P6-C1, P6-C2); do NOT touch versioning or the schema-hash gate (P6-D) beyond embedding GENERATED_SCHEMA_SURFACE_HASH in the file. Five things must all hold. (1) The record set is the closure over live roots (the Game.state record - a registry object if Plan 4 unit P4-B landed - Players, Zones, engine singletons, state watchers, cards in zones, registered effects and abilities) through decorated refs plus the uuid-bearing payloads P5C-1's extractors report, NEVER "every registered GameObject": allGameObjects still holds every expired effect and superseded wrapper snapshot history pinned, and a load discards that history anyway; dev-assert at write time that no emitted record references a uuid outside the emitted set. (2) Records are emitted in Plan 5's in-record layout (classTag + recipe + state) so the file embeds the same shape the in-memory system produces. (3) File-level JSON hardening, the flag Plan 3 handed here: tag-encode non-finite numbers as {"$num": "NaN" | "Infinity" | "-Infinity"} (the tag is already reserved in STATE_ENCODING_TAGS and decodeStateValue deliberately throws on it today - add the decode branch in the same commit) and HARD-FAIL on undefined-valued keys inside value payloads; round-trip test both. (4) The engineOnlyFacts manifest is EXTENDED, not replaced: the shipped categories are lastingEffect, gainedAbility, delayedEffect (custom-duration events are delayedEffect with duration 'custom'), watcherEntry, pilotLeader and unrepresentedCard (SavedMatchInterfaces.ts:206), and the same entry shape now declares facts CARRIED in engineState but absent from the semantic tier; shrink the dropped set check by check, each with a round-trip test, across all six categories - not the four the plan lists - until the manifest is exactly the engine-minus-semantic difference and A's capture hard-fail is the only writer failure mode. (5) Cross-tier validation as a dev-mode check comparing semantic-tier facts against the records and asserting the manifest equals the difference. Re-run npm run measure-degradation and record the manifest counts in the plan doc next to P2-E's 9.9% baseline. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-b1
```

### `P6-C1` — Loader: identity matching and the translation table

```bash
/orchestrate --tier 4 Implement docs/plans/06-full-fidelity-save.md work item C (Loader: identity mapping and restoration) steps 1 and 2 ONLY, plus the scope-mechanism amendment those steps need. Proof level: hardened. Unit P6-B1 has landed the writer; Plan 5 units P5A-2 (scopes with the match step factored from the rekey step) and P5B-1 (composite coordinates) have landed. Scope fence: do NOT construct file-only records, rewrite refs, or apply records (unit P6-C2); do NOT touch versioning (P6-D). The decision is fixed and must not be reopened: load-time uuid TRANSLATION - file uuids are file-internal record identifiers and are never adopted by live objects (invariant 2). Step 1: a fresh Game through Plan 2's path - MatchLoader.loadAsync's construction and ScriptedSetupRunner driven setup - SKIPPING MatchPositionInjector, and inside the same whole-body router-proxy window P2-C2 established, because every engine drive outside that window reopens the error-swallow hole that took three attempts to close. Step 2: match every live object to its record by stable coordinates only - Players by seat, Zones by (seat, zoneName), singletons and watchers by classTag or StateWatcherName, cards by (owner seat, internalName, arbitrary among interchangeable copies) and NOT by the file's (seat, zone, ordinal), fan-out by Plan 5b's table - entering every pairing into the fileUuid -> liveUuid translation table, with the three dispositions (Matched, Constructed, Discarded) applied before any failure is declared and a hard fail for anything still unmatched afterwards. The Plan 5 amendment: rehydration scopes are legal only while _rollbackDepth > 0 (P5A-2 left this as a single predicate); this load runs outside any rollback, so add the load-mode gate alongside it and the PAIRING key policy for scope close (match as in 5b, keep live uuids, record the pairing; occupancy assert and no-scratch-leak sweep unchanged). Say in the commit that this loosens a Plan 5 gate. Specs: every disposition exercised; an unmatched record and an unmatched live object each hard-fail; a control-changed card matches by owner, not controller. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-c1
```

### `P6-C2` — Loader: construction, rewrite, apply

```bash
/orchestrate --tier 3 Implement docs/plans/06-full-fidelity-save.md work item C steps 3 through 6 ONLY, plus the second half of work item G. Proof level: hardened. Unit P6-C1 has landed matching and the translation table; Plan 5 units P5B-3, P5B-4 and P5C-1 supply the recipes and the extract-and-rewrite ref extractors; unit P6-A1 supplies the capture recipes. Scope fence: do NOT touch versioning or degradation (P6-D); do NOT touch the error-path save (P6-B2). Step 3: construct the file-only records - effects, gained abilities, wrappers, tokens, delayed and custom-duration events - through Plan 5 factories and recipes in ASCENDING FILE-UUID ORDER (file uuids preserve creation order and dependency order rides on it), inside scopes in pairing mode; this is where captured lasting effects are RE-APPLIED, never re-resolved, by feeding a synthetic minimal context (source, player, captured target and params) to the per-resolution property factories, with a factory that reads a context field the capture did not preserve being a hard load failure. Step 4: rewrite every uuid reference in every record through the table before applying - generated deserializers know the ref-typed fields, opaque payloads go through P5C-1's extractors, the Game.state record is rewritten the same way - and a file uuid absent from the table is a hard failure, never a dangling ref. Step 5: apply records through the generated deserializers, then recipes' post-construction linking, then onRehydrate, then afterSetState/afterSetAllState in Plan 5 A3's order. Step 6: restore RNG, resolveGameState(true) inside a real event window exactly as P2-C2 had to (a bare call crashes when a restored effect defeats a unit), clearAllSnapshots(), postRollbackOperations({ Round, WithinActionPhase }); the re-entered ActionWindow takes the first snapshot and, if Plan 4 landed, arms the tracker. Also: restore Game._lastAttackId (a plain field at Game.ts:322, minted at :749-750) as an engine-tier scalar, and audit for other plain-field id generators outside decorated state. G's second half: apply A's identity-plus-re-derive recipe to Clone's and Fives' parameter bags (capture the copied target's card identity, re-derive printed attributes from static card data at load - defeated-token-safe), and confirm through the capture dev-assert audit that the residue is now empty for those files. The uuid counter is NOT restored from the file. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-c2
```

### `P6-B2` — Error-path saves from the last action snapshot

```bash
/orchestrate Implement the "Add a snapshot-buffer read path" bullet of docs/plans/06-full-fidelity-save.md work item B ONLY. Proof level: hardened. Unit P6-B1 has landed the engine-tier writer. Scope fence: do NOT touch the loader; do NOT build a semantic tier from snapshot records - error-path saves are ENGINE-TIER-ONLY by decision, the semantic tier is marked absent, cross-tier validation is skipped, and work item D's degradation fallback is explicitly unavailable for them (refusal only). Write from the last action snapshot rather than the live game, for Lobby.handleError (:1794) and handleSerializationFailure (:1854), which a halted game gives no next boundary to arm. Two facts about current main: snapshot.states is already the uuid-keyed record map (SnapshotInterfaces.ts:136), and card identity does not need it - internalName is a readonly constructor field (Card.ts:116, :364) so the still-live objects supply identity for every uuid. Order it correctly against handleError's SevereHaltGame branch, which calls captureGameState and constructs pristine GameObjects (P3-PB2 suspends the registration guard for that): the snapshot read must not observe those, so run before that branch or read only the retained records. Plan 4 coupling: if unit P4-F landed, the "last action snapshot" is hollow or a reverse delta, so this read goes through P4-F's documented window-start materialization entry point (serialize live, overlay the pending window's old values, drop pending-created objects), costing O(live) + O(pending delta) once per crash; if P4-C memoization landed without P4-F, the current snapshot is a full record map and the read is direct. Explicitly NOT rollback-and-restore. Attach through the existing formatAndSendReportAsync Discord path as P2-D does; the client still receives only a boolean. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-b2
```

### `P6-D` — Versioning, the schema-hash gate, degradation

```bash
/orchestrate Implement docs/plans/06-full-fidelity-save.md work item D (Versioning & migration) ONLY. Proof level: hardened. Units P6-C1 and P6-C2 have landed. Two prerequisites to verify before planning, because this unit's gate is only sound with both: Plan 4 unit P4-B (Game.state is a registry object, so GENERATED_SCHEMA_SURFACE_HASH covers it - before that a renamed IGameState field changed every payload with the hash green, as recorded in 03-codegen-serializers.md Phase B step 2) and Plan 5 unit P5A-1 (recipe-section field names are hash inputs). Scope fence: do NOT build a classTag alias map (non-goal by decision); do NOT add setup or regroup save points; do NOT touch the writer or loader beyond the version and gate plumbing. In scope: SAVED_MATCH_FORMAT_VERSION bumps to 2 with a migration chain under which v1 semantic-only files load forever; the engine-tier compatibility gate is GENERATED_SCHEMA_SURFACE_HASH (re-exported from server/game/core/StateSerializers.ts) embedded at save and checked at load - the schema-surface hash, NOT the generation-cache hash, so comment edits and refactors do not invalidate saves - with a spec proving a field rename invalidates the engine tier and a comment edit does not; the answer to Plan 5's classTag handoff in writing (no aliasing layer; renaming a @registerState class is a release-noted save-breaking change, documented in docs/state-fields.md); card-data-version policy (semantic tier loads across versions with a warning, engine tier requires exact match); and the degradation protocol under invariant 4 - on hash mismatch or a corrupt engine tier, semantic-tier loading only after presenting the engineOnlyFacts manifest and receiving explicit confirmation, refusal with a non-empty manifest and no confirmation channel, and refusal outright for error-path saves and any non-action-window timepoint, since Plan 2's loader is action-timepoint-specific. Settle at the plan gate, not during implementation: whether the end-of-action-phase timepoint is built at all - the plan admits it only as work item A's de-risk fallback, and if P6-A1 and P6-C2 landed capture in full, the honest answer is not to build it. Do NOT run the performance capture; that belongs to unit P6-F. task_id: p6-d
```

### `P6-F` ⏱ — Verification, measurement, docs and the closing capture

```bash
/orchestrate Implement docs/plans/06-full-fidelity-save.md "Verification", work item F (Measurement), and work item E (hidden-information documentation) ONLY. Units P6-A1 through P6-D have all landed. Scope fence: no new mechanism; tests, measurement, docs, and the capture. Build all seven verification groups: (1) the round-trip corpus - save -> load -> save produces deeply-equal documents under fileUuid normalization through the translation table, across positions generated by running the integration suite with a save/load hook at every snapshot point through serialize -> fresh process -> deserialize (the undo-all-tests pattern; test/helpers/SaveLoadHarness.ts from P2-E is the starting point), with the residue reported as a number - the set of corpus positions that fail the capture hard-fail, expected empty after P6-C2 but found by the audit, not assumed; (2) the order-preserving uuid-renumbering fuzz - a monotonic remap of every file uuid, refs included, loads to an identical game and identical re-save; (3) continuation equivalence, including a loaded forThisPhaseCardEffect expiring at phase end and a loaded gained ability being used; (4) cross-tier validation tests; (5) the degradation test with the confirmation and refusal paths; (6) the JSON-hardening round trip; (7) the capture hard-fail regression guard with a test-only card carrying a function-valued until closure. Measurement (F): full-save document size across the corpus (gzip at rest before inventing anything cleverer if it is large), writer latency at a save point compared to one snapshot, and the CI cost of the corpus, used to pick the representative subset honestly. Docs (E): state wherever the artifact is produced that full saves contain deck order and both hands; the scrubbed export stays deferred. This is the FINAL unit of Plan 6 and the roadmap's closing bookend: run `npm run benchmark -- --name final-performance --compare pre-roadmap-baseline` with ENABLE_PARITY_HARNESS unset, also compare against after-plan-05c and after-plan-04 so a regression is attributable, commit both generated files under docs/plans/performance/ with a README row, and write the no-regression verdict into the plan doc - the roadmap's performance verdict was written at P4-G and is not rewritten here, but any row that gave back a Plan 4 win is named, and any headline row that changed meaning along the roadmap (payload/gameStateBuffer, payload/gameObjectStatesBuffer, payload/fullSnapshotTotal at P3-PB2) is called out as not comparable. task_id: p6-f
```

---

## Cross-plan sequencing

Plans 2 and 3 were independent and both have landed; the two sequencing notes this section used to carry for them (order `P2-A2` before `P3-PA0` for the watcher field inventory, and `P1-A`'s option-1-vs-2 choice as a Plan 5 input) are discharged — `P2-A2` landed first, and option 1 landed, as recorded in Plan 5's decisions above. Plans 4, 5 and 6 are not independent, and the order below is the recommended one, not the only legal one.

**Plan 4 → Plan 5 → Plan 6, serially, with three concurrency pockets.** The reason for serial: `P4-F`, `P5A-2` and `P5A-3` all rewrite `GameStateManager.rollbackToSnapshot` and the shared rollback entry in `SnapshotManager`, and running any two of those concurrently is a merge hazard on the most sensitive method in the engine. Plan 5 may begin as soon as `P4-D`'s verdict is written if the verdict is MEMOIZATION (no `P4-E`/`P4-F`), and after `P4-F` otherwise; either way `P4-B` must land before Plan 5 starts, because `P5A-3`'s `Game.state` handling and `P6-D`'s hash gate both depend on it. Plan 6 begins after `P5B-6`, since `P6-A1` needs the 5b classification and recipe sections; `P6-B1` additionally needs `P5C-1`, and the loader units need all of 5b.

Recommended serial order:

```
P4-0 → P4-0b → P4-1 → P4-A → P4-B → P4-C → P4-D ⏱(interim) → [P4-E → P4-F] → P4-G ⏱
     → P5A-1 → P5A-2 → P5A-3 → P5A-4 → P5A-5 → P5A-6 ⏱
     → P5B-1 → P5B-2 → P5B-3 → P5B-4 → P5B-5 → P5B-6 ⏱
     → P5C-1 → P5C-2 → P5C-3 → P5C-4 ⏱
     → P6-G → P6-A1 → P6-B1 → P6-C1 → P6-C2 → P6-B2 → P6-D → P6-F ⏱
```

Units that can genuinely run concurrently, with the reason each is safe:

- **`P4-0`, `P4-0b`, `P4-1`, `P6-G` at any time**, including before Plan 4 starts. `P4-0` and `P4-0b` are quick-rollback-policy fixes on main with no delta code; `P4-1` is a harness change; `P6-G` is engine-side `until` syntax plus three card files, depending on nothing in Plans 4 or 5. None of the four touches `GameStateManager`.
- **`P5A-4` (listener registration from state) alongside `P5A-2`.** It needs the `onRehydrate` hook declared, which `P5A-3` lands, but its own work is in the five listener holders, not in the rollback path; plan it concurrently and merge it after `P5A-3`.
- **`P5C-1` (ref extractors) alongside any of 5b.** It depends on 5a only, lives in the encoders and the value-payload owners, and 5b never touches those files.
- **`P5B-3` and `P5B-4`** are independent recipe families after `P5B-2`.
- **`P6-B2` alongside `P6-C1`/`P6-C2`.** The error-path save is writer-side and never touches the loader.

Every other adjacent pair shares a file that the later unit changes the meaning of.

Three cross-plan facts that are not obvious from any single plan, stated here so no unit rediscovers them:

- **`P4-B` is a Plan 6 prerequisite, not a Plan 4 nicety.** `GENERATED_SCHEMA_SURFACE_HASH` does not cover `Game.state` until `Game.state` is a registry object; `P6-D` must refuse to plan without it.
- **The delta stage of Plan 4 is conditional, and every Plan 5 and 6 fence names both cases.** If `P4-D` chooses MEMOIZATION, the couplings that read "if `P4-F` landed" collapse to the full-snapshot case: the retained reference set is the memoized record map, sweeps run at every timepoint, and the error-path save reads a full record map. Nothing in Plans 5 or 6 is blocked by that choice.
- **`P5A-2` and `P6-C1` each loosen a guard another unit shipped tight** (`P1-B`'s registration guard and `P5A-2`'s rollback-only scope gate respectively). Both invocations say so in those words, and both carry a tier override so a single reviewer never signs off a weakened safety check alone.

`docs/plans/NEXT-DECOMPOSITION-PROMPT.md` was consumed by this extension on 2026-09-20 and is retained only as the record of the prompt that produced it.
