# Implementation Order

The plans in this directory are **design docs**, not implementation handoffs. This
file is the bridge: it breaks each plan into **units** — one unit = one
`/orchestrate` (or `/orchestrate-mini`) run = one staged diff = one commit gate.

This is a **backlog, not a set of plans**. No unit is planned in advance. Each
unit gets its handoff written by the Anvil plan stage immediately before it is
implemented, so the plan is always written against current `main` rather than
against `7a0526549` (the commit every line reference in the plan docs is anchored
to). That freshness is the whole reason for planning just-in-time.

**Plans 4–6 are deliberately not decomposed yet.** See the last section.

---

## Conventions

### Routing

| Unit shape | Command |
|---|---|
| Small, tightly specified, no design decision left open | `/orchestrate-mini` |
| Anything Medium+, or anything with an open decision, or 🔴 | `/orchestrate` |

`/orchestrate-mini` escalates to full `/orchestrate` on its own if a unit turns
out Large **and** 🔴. Trust that valve — do not grind a unit through mini.

Sizes and risk markers below use the Anvil classification vocabulary
(`Small|Medium|Large`, `🟢|🟡|🔴`) so they line up with the pipeline's own
model routing. They are **estimates for scheduling**, not instructions to the
plan agent — the plan stage classifies the unit itself, and its classification
wins.

### Task IDs

This roadmap is ~18 orchestrate runs, each creating a committable
`.anvil/{task_id}/` folder. Use the unit ID from the tables below, lowercased,
as the `task_id`: `p1-a`, `p2-a2`, `p3-pa2`. That keeps `resume`
disambiguation and the committed audit trail legible when several runs are
in flight or abandoned.

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
| 3 | `P3-PB3` | `npm run benchmark -- --name after-plan-03 --compare initial-performance` |

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

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P1-E` | Item E — housekeeping / dead-code deletion | — | Small 🟢 | mini |
| `P1-C` | Item C — seed the RNG in production, surface the seed | — | Small 🟡 | mini |
| `P1-A` | Item A — `OngoingEffectValueWrapper` churn + `refreshContext` caching | — | Medium 🔴 | orchestrate |
| `P1-B` ⏱ | Item B — restore `lastGameObjectId`, `_isRollingBack` guard, client-protocol audit | `P1-A` | Medium 🔴 | orchestrate |

Item D is **not scheduled** — it is a prerequisite contract for a future
client-facing bookmarks feature. Do not create a unit for it.

**Run `P1-E` first.** It is the smallest real change in the roadmap and doubles as
a shakedown of the pipeline itself — you find out whether the Forge verification
and the commit gate behave on this repo before betting a 🔴 unit on it.

### `P1-E` — Housekeeping

```bash
/orchestrate-mini Implement docs/plans/01-snapshot-hygiene.md work item E (Housekeeping) ONLY. In scope: delete SnapshotArray + SnapshotFactory.createSnapshotArray; delete dead GameObjectBase.getState(); fix test/helpers/IntegrationHelper.js:78 (UndoMode.Full -> UndoMode.Free); surgically remove never-called UndoLimit.reset()/isPerGameLimit() while keeping incrementUses and hasReachedLimit. Scope fence: do NOT touch work items A, B, C, or D. Do NOT delete any git branches in this run - branch deletion is a manual step for the repo owner. Do NOT run the performance capture; that belongs to unit P1-B. task_id: p1-e
```

Item E's branch-deletion bullet is carved out on purpose: deleting local branches
is irreversible and the plan itself says to verify supersession by diff first.
Do that by hand.

### `P1-C` — RNG seeding

```bash
/orchestrate-mini Implement docs/plans/01-snapshot-hygiene.md work item C (Seed the RNG in production and surface the seed) ONLY. Scope fence: do NOT touch work items A, B, D, or E. Treat the "seed is a server-side secret" constraint as a hard requirement, not a nice-to-have: the seed must never reach any client-bound payload, and a Bo3 lobby must mint a fresh seed per Game instance. Include the test or check that asserts the seed's absence from client-bound game/lobby state. Do NOT run the performance capture; that belongs to unit P1-B. task_id: p1-c
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
/orchestrate Implement docs/plans/01-snapshot-hygiene.md work item A (Eliminate OngoingEffectValueWrapper churn) ONLY, including the "Related fix in the same area" (per-OngoingEffect context caching). Scope fence: do NOT touch work items B, C, D, or E. Two things must be settled at the plan gate rather than during implementation: (1) option 1 vs option 2 from the plan's Direction section - the plan prefers option 1 because Plan 5 stage 5b depends on the decorated-value subset it establishes, so a choice of option 2 must be justified explicitly and flagged as a Plan 5 impact; (2) the aliasing audit the plan calls for - with in-place context mutation, every retainer of OngoingEffect.context / impl.context observes post-rollback values retroactively, and the plan requires that audit before landing. Respect the plan's out-of-scope list: retention semantics for GainAbility, AdditionalPhaseEffect, GainKeyword and for function- or GameObject-bearing values are unchanged. Gate on the full suite plus ENABLE_UNDO_ALL_TESTS=true, not the default suite. Do NOT run the performance capture; that belongs to unit P1-B. task_id: p1-a
```

### `P1-B` ⏱ — `lastGameObjectId` restore

Blocked on `P1-A` landing **in full**. Landing this after only the context fix
makes the unconditional `_isRollingBack` guard crash every rollback in any game
with a live dynamic ongoing effect.

```bash
/orchestrate Implement docs/plans/01-snapshot-hygiene.md work item B (Restore lastGameObjectId on rollback) ONLY. Work item A has already landed in full (both the transient-churn fix and the context fix) - verify that before planning, because this item's zero-registration contract is unreachable otherwise. Scope fence: do NOT touch work items A, C, D, or E. In scope: restore _lastGameObjectId at the end of rollback including the error-recovery path; activate the _isRollingBack guard so register() hard-fails during rollback, implemented nesting-safe via a depth counter because rollbackToSnapshot re-enters itself on the recovery path; add the gameObjectMapping occupancy assert in register(); the uuid-reuse audit against non-state-tracked structures only. The guard lands UNCONDITIONAL here - Plan 5's rehydration-scope carve-out arrives with Plan 5, not now. The client-protocol audit is a required deliverable, not optional: uuids are the client's card identifiers, and with reuse a stale inbound message can silently bind to a different card, so this needs either action-sequence guards on inbound messages around rollback or a demonstration that inbound messages are drained/invalidated before rollback completes. This is the FINAL unit of Plan 1: after the diff is green, run `npm run benchmark -- --name after-plan-01 --compare initial-performance` and commit both generated files under docs/plans/performance/. task_id: p1-b
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
| `P2-B` | Item B — JSON-safety dev assertion in the decorator layer | — | Small 🟢 | mini |
| `P2-A` | Item A — `ISavedMatch` schema, writer, `engineOnlyFacts` manifest | `P2-B` | Large 🟡 | orchestrate |
| `P2-A2` | Item A2 — per-watcher semantic entry encoding | `P2-A` | Large 🔴 | orchestrate |
| `P2-C1` | Item C.3/C.4 — headless prompt driver + engine-side state injection | `P2-A` | Large 🟡 | orchestrate |
| `P2-C2` | Item C — `MatchLoader` proper: validation, seat binding, restore order, pipeline re-entry | `P2-A2`, `P2-C1` | Large 🔴 | orchestrate |
| `P2-D` | Item D — save/load socket surface + the armed one-shot trigger | `P2-C2` | Medium 🟡 | orchestrate |
| `P2-E` ⏱ | Item E — round-trip, continuation, degraded-manifest, trigger tests + degradation-rate measurement | `P2-D` | Medium 🟡 | orchestrate |

**Land `P2-B` first, before the writer.** It is the standing-invariant
enforcement, and it will likely surface existing `@stateValue` payloads that
violate it. Finding those while fixing a 30-line guardrail is much cheaper than
finding them inside the writer unit.

### `P2-B` — JSON-safety dev assertion

```bash
/orchestrate-mini Implement docs/plans/02-semantic-save-load.md work item B (JSON-safety dev assertion) ONLY. Add a dev-mode check in the decorator layer that @stateValue values must be JSON-representable or a known encodable type (Map/Set with JSON-safe elements, GameObjectId), modelled on the existing StateWatcher dev check at StateWatcher.ts:105-110. Note the distinction the plan draws: GameObjectIds are legal in engine state - invariant 2 bans them only from save FILES, which is work item A2's problem, not this one. Scope fence: do NOT touch work items A, A2, C, D, or E; do not write any save-format code. Expect this to surface existing violating payloads - fix them or report them, do not weaken the check to accommodate them. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-b
```

### `P2-A` — Schema + writer + manifest

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item A (Schema + writer) ONLY, including the full "Schema (v1)" section that defines ISavedMatch. Scope fence: do NOT implement work item A2 (state-watcher entry encoding) - leave the stateWatchers section of the schema defined but written as empty/unpopulated with a clearly marked TODO for A2; do NOT touch work items C, D, or E. Work item B (the JSON-safety dev assertion) has already landed. Two rules the plan is emphatic about and that must survive review: (1) do NOT reuse Game.captureGameState - it deliberately truncates (top-5 deck cards, no limits/effects) and this writer must be lossless for the schema's scope; (2) the degrade-with-manifest rule is WRITE-SIDE ONLY - unrepresentable game state degrades with an enumerated engineOnlyFacts entry, but Card.nextAbilityIdx coordinate drift still HARD-FAILS at write time, because a save whose coordinates cannot be trusted is corrupt rather than degraded. Implement the nextAbilityIdx detection procedure the plan specifies (re-derive the identifier set from a pristine instance of the card class, hard-fail if the identifier about to be emitted is absent). The engineOnlyFacts schema is inherited by Plan 6 - treat its shape as a published contract. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-a
```

### `P2-A2` — State-watcher entry encoding

The hardest unit in Plan 2. It carries the negative-range counter-minting
decision, which exists to prevent a rewritten `activeAttackId` from colliding with
a *future* live attack id and making Flash the Vents count stale pre-save damage.

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item A2 (State-watcher entry encoding) ONLY. Work item A has landed; the schema's stateWatchers section currently exists but is unpopulated - this unit fills it. Scope fence: do NOT touch work items C, D, or E. Required deliverables, all three: (1) the shared ISavedCardRef encoding, whose zone domain is WIDER than the array zones - it must include the singleton positions leader and base with ordinal 0, and a sub-position form for cards nested in an arena entry's upgrades/capturedCards arrays, or saves degrade spuriously after any leader deploy or base heal; (2) a per-watcher field inventory covering EVERY non-GameObjectId field of every entry struct in server/game/stateWatchers/, each explicitly classified as semantic data, stint flag, order-only counter, or live-comparison counter - the plan's list of examples is an example, not the inventory, and the inventory must be produced before any serializer is written; (3) the serializers themselves. Two decisions are already made and must not be re-litigated: live-comparison counters are minted by the loader from a NEGATIVE, order-preserving range (live generators only ever produce non-negative ids, so collision is impossible and no engine change is needed - the alternative of restoring lastGameEventId and bumping _lastAttackId was explicitly rejected); and the two Set<Trait> payloads (AttacksThisPhaseWatcher.attackerAttributes, CardsDefeatedThisPhaseWatcher.lastKnownInformation) are captured-at-event-time semantic data that must be SERIALIZED via tagged-Set encoding, not dropped. Unresolvable referents drop the entry and append a watcherEntry manifest entry - enumerated, never silent. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-a2
```

### `P2-C1` — Headless prompt driver + engine-side state injection

Carved out of item C deliberately. This is the "large incidental win" the plan
names — state injection stops being test-only code and becomes a supported engine
feature, with the test helpers reduced to thin wrappers. It is worth landing and
reviewing on its own terms, and it de-risks `P2-C2` substantially.

```bash
/orchestrate Implement ONLY the engine-side-port half of docs/plans/02-semantic-save-load.md work item C - specifically C step 3's headless prompt driver and C step 4's state-injection port. Scope fence: do NOT build MatchLoader itself, do NOT implement C steps 1, 2, 5, or 6, and do NOT touch work items D or E. In scope: (a) port GameFlowWrapper's setup-driving logic (selectInitiativePlayer, keepStartingHand, resourceAnyTwo) into engine code as a scripted setup runner that answers prompts by prompt TYPE, never by title-string matching; (b) port the PlayerInteractionWrapper / GameStateBuilder injection operations into engine-side code (moveAllNonBaseZonesToRemoved, setGroundArenaUnits, setHand, setDeck, setLeaderStatus, setBaseStatus, setResourceCards, setDiscard, setHasTheForce, setCreditTokenCount, upgrade/capture attachment, damage/exhaust state, explicit outsideTheGame placement); (c) refactor the test helpers into thin wrappers over the new engine implementation, with the existing suite green as the proof. Two mandatory deviations from the helpers, both from the plan: the engine-side setLeaderStatus must NOT do implicit deploy-limit bookkeeping (the helper increments it by title-string matching on '.includes("Deploy")' - use isEpicActionLimit() for identification and leave ALL limit counts to the loader's restore pass); and the injection path must expose a post-injection assertion that the outsideTheGame staging zone contains exactly what was intended, since moveAllNonBaseZonesToRemoved stages every card there and any card the caller failed to place would silently remain. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-c1
```

### `P2-C2` — MatchLoader

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item C (Loader) ONLY, EXCLUDING the parts already landed by unit P2-C1. Already landed and to be consumed, not rebuilt: the headless prompt driver (C step 3) and the engine-side state-injection operations (C step 4). Also already landed: work items A, A2, and B. Scope fence: do NOT touch work items D or E. In scope: MatchLoader.loadAsync - C steps 1, 2, 5, and 6. Specific requirements the plan pins: validate formatVersion but do NOT gate on cardDataVersion (that would brick every save on every card-data refresh); instead validate that every internalName, token name, and abilityIdentifier resolves against current card data, reporting saved-vs-current cardDataVersion as error diagnostics. Restore order is exactly as specified and is not a free choice: per-copy ability-limit counts (the single authority for ALL limits including epicDeployUsed), then watcher entries, chat, timers, RNG state, Game.state scalars, then the passedActionPhase derivation. Chat restore REPLACES the message log, never appends - the driven setup generates its own messages. Timer restore persists only main-timer remaining; isOnMainTimer is deliberately not persisted, and ByoyomiTimer needs a small public restore method added. Finish with resolveGameState(true), clearAllSnapshots(), then postRollbackOperations({ Round, WithinActionPhase }). The degrade-with-manifest rule NEVER applies on the load side: unknown coordinates, schema violations, corrupt or truncated files, and staging-zone residue all hard-fail loudly. A save with a non-empty engineOnlyFacts manifest loads normally and the loader surfaces the manifest to the caller. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-c2
```

### `P2-D` — Server plumbing + armed one-shot trigger

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item D (Server plumbing) ONLY. Work items A, A2, B, and C have landed. Scope fence: do NOT touch work item E. In scope: the save socket surface emitting the JSON document; the armed one-shot save trigger; the dev-facing load flow that binds users to seats and surfaces the engineOnlyFacts manifest. The armed one-shot is the substantive piece: a request arriving at an action-window boundary saves inline, otherwise the lobby stores { requestedAtActionNumber, requestedAtPhase } and arms a one-shot that the NEXT action-window boundary consumes - and this must work independently of undoMode, guarding the SnapshotManager early-returns at :116 and :134. The armed state is bound to the current game instance and cleared on game end, on phase exit to regroup, and on disconnect; a stale flag firing into a later round would produce an artifact that silently misrepresents the reported moment, which is the one failure mode this unit must not ship. Hidden information is DOCUMENTATION-ONLY for v1 by explicit decision - deck order and hands are in the file in cleartext because the recipient is the dev team and that is exactly what makes a report reproducible; document the constraint, do not build a scrubbing writer mode. Server-side save storage is out of scope. Do NOT run the performance capture; that belongs to unit P2-E. task_id: p2-d
```

### `P2-E` ⏱ — Verification

```bash
/orchestrate Implement docs/plans/02-semantic-save-load.md work item E (Verification) ONLY. Work items A, A2, B, C, and D have all landed. This unit is the cross-cutting test suite that only makes sense once the whole arc exists. Build all five groups the plan enumerates: (1) round-trip property tests with the two defined normalizations - savedAt excluded, and stateWatchers compared as maps keyed by watcher name with absent-equals-empty, because GameStateBuilder registers every watcher in the library while production games register only what their cards request; for a degraded first save the property is that the documents match after excluding engineOnlyFacts and savedAt AND the re-save's manifest is empty; (2) continuation tests for all eight required scenarios, which must pass for non-degraded saves only; (3) degraded-save manifest tests asserting each category enumerates exactly what was dropped and nothing else; (4) armed-one-shot trigger tests including the undo-disabled case and the stale-flag-clearing cases; (5) writer hard-refusal and load-side rejection tests. Also implement the degradation-rate measurement instrumented against the existing integration-test suite - this is for visibility and is explicitly NOT a ship gate. This is the FINAL unit of Plan 2: after the suite is green, run `npm run benchmark -- --name after-plan-02 --compare initial-performance` and commit both generated files under docs/plans/performance/. task_id: p2-e
```

---

## Plan 3 — Codegen State Serializers

Seven units plus one deferred. This is the plan the rest of the roadmap sits on:
Plans 4, 5, and 6 all consume its output, so a shortcut here is paid for three
times.

| Unit | Scope | Depends on | Size | Route |
|---|---|---|---|---|
| `P3-PA0` | Phase A step 0 — migrate `StateWatcher` off direct state-bag writes | — | Medium 🔴 | orchestrate |
| `P3-PA1` | Phase A steps 1–2 + step 6 registry policy + **step 10 lint fix** — generator, record format, schema-surface hash | `P3-PA0` | Large 🔴 | orchestrate |
| `P3-PA2` | Phase A step 3 — parity harness, serialize leg | `P3-PA1` | Medium 🟡 | orchestrate |
| `P3-PA3` | Phase A step 4 — parity harness, restore leg | `P3-PA2` | Medium 🔴 | orchestrate |
| `P3-PA4` | Phase A step 5 — coverage/staleness cross-check | `P3-PA1` | Medium 🟡 | orchestrate |
| `P3-PB1` | Phase B step 7 — `stateMap`/`stateSet`/`stateArray` decorator split | `P3-PA1` | Medium 🟡 | orchestrate |
| `P3-PB2` | Phase B steps 1–5 — **the cutover** | all of Phase A, `P3-PB1` | Large 🔴 | orchestrate |
| `P3-PB3` ⏱ | Phase B step 9 — docs + perf capture | `P3-PB2` | Small 🟢 | mini |
| `P3-PB4` | Phase B step 8 — retire the parity harness | `P3-PB2` + one release cycle | Small 🟢 | *deferred* |

Three sequencing calls worth stating explicitly, since none is obvious from
reading the plan linearly:

**Step 10 (the lint fix) is not a Phase B unit.** The plan buries it at the end of
Phase B but says in two places that it must land *in the same PR* as the
non-optional generated-module import. `.github/workflows/pullrequest.yml:24` runs
`npx eslint --quiet` with no build step, so the moment the import goes
non-optional, every PR's lint job breaks. It is folded into `P3-PA1`.

**Step 7 (the decorator split) is sequenced before the cutover, not after.** The
plan lists it as Phase B step 7 with the rationale "do it now, while touching
every call site anyway." Landing it *before* `P3-PB2` gets the mechanical
call-site sweep reviewed on its own and takes it out of the largest diff in the
roadmap.

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
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 0 (Migrate StateWatcher off direct state-bag writes) ONLY. The plan explicitly says this lands first as its own PR, before the rest of Phase A. Scope fence: do NOT port the generator, do NOT build any parity harness, do NOT touch Phase A steps 1-6 or any of Phase B. In scope: change StateWatcher's entries to `@stateValue() private accessor entries: TState[] = []`, route reads through the accessor, delete the constructor bag-write, and retire CopyMode.UseBulkCopy plus copyState's bulkCopyMetadata branch (StateWatcher is their only user). v2's cutover commit 7e6545fd7 is the template. Audit for other direct bag writers, but note two known non-hits: TokenCards.ts uses `declare state: never` (inert), and the ~30 `this.state.` matches in Game.ts are Game.state: IGameState, not the bag - Game is not a GameObjectBase. This changes watcher restore from bulk-copy to field-copy - same data, different mechanism - so gate on the full suite plus `npm run test-undo` before considering it done. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa0
```

### `P3-PA1` — Generator + record format + lint fix

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A steps 1 and 2, PLUS Phase B step 6's registry key policy, PLUS Phase B step 10's lint-job fix. Phase A step 0 has landed. Scope fence: do NOT build the parity harness (steps 3-4), do NOT build the coverage cross-check (step 5), do NOT begin the cutover. Step 10 is included here and NOT deferred to Phase B: the plan states in two places that the lint fix must land in the same PR as the non-optional generated-module import, because .github/workflows/pullrequest.yml:24 runs eslint with no build step and would break on every PR otherwise; the chosen shape is a resolver carve-out for the generated path, not full generation in the lint job. Required elements: the ts-morph generator with static mixin-chain resolution; the gitignored + build-step + hard-fail generated-file policy with a non-optional runtime import; the generation cache (cheap text scan for decorator names before instantiating ts-morph, hashing the candidate set plus the transitive mixin files the resolver visited on the last run - embed BOTH in the artifact header, because a pure mixin-composition file like AllAbilityTypeRegistrations.ts mentions no decorator name yet sits in the ancestry of every InPlayCard); the recursive JSON-safe record encoders with the $map/$set tag vocabulary, which THROW on anything they cannot tag-encode; and the schema-surface hash, which is DISTINCT from the generation cache hash - its inputs are only the semantic surface (sorted classTag to sorted field names plus field kinds, the encoding-tag vocabulary, the engine-tier format version), so comment edits and refactors must not change it, because Plan 6 gates save compatibility on it. Two hard requirements from the plan: generated serializers must be SIDE-EFFECT-FREE, reading go.uuid directly and never calling getObjectId() - this is what keeps main's remove-then-serialize snapshot order valid, and it is why -morph's order flip must NOT be ported. And the registry must cover the three card-file-local @registerState classes (Bamboozle.ts, FirstLightHeadquartersOfTheCrimsonDawn.ts, Advantage.ts); the three non-exported classes (PlayBamboozleAction, FirstLightSmuggleAction, and CustomDurationEvent, which is in core's OngoingEffectEngine.ts, not under cards/) are exported so the registry can import them, and the generator hard-forbids new module-local @registerState classes going forward. Do a one-time audit of current stateValue payloads inspecting STORED values, not declared types - the plan names DefeatedCardEntry.wasDefeatedWhileAttacking as a case where the declared type carries a live Player but the updater actually stores a boolean. Record cold and warm generator wall-clock as acceptance numbers. The old system stays authoritative throughout this unit. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa1
```

### `P3-PA2` — Parity harness, serialize leg

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 3 (Parity harness, serialize leg) ONLY. Steps 0-2 have landed; the generator exists and the old system is still authoritative. Scope fence: do NOT implement step 4 (the restore leg) or step 5 (the coverage cross-check); do NOT begin the cutover. Build the test-mode hook that runs both the existing getStateUnsafe()+v8 path and the generated serializer at every snapshot point, normalizes, and deep-compares per uuid. Three requirements that decide whether this harness is trustworthy: it must be SIDE-EFFECT-FREE (read refs via .uuid, never getObjectId()); the normalizer must define undefined-equals-null for ref-typed fields up front, because main's bag stores newValue?.getObjectId() so undefined genuinely occurs while generated encoders emit `?? null`; and Maps/Sets are compared in ITERATION ORDER, not sorted - the order is deterministic and survives the v8 round-trip, and sorting would need comparators for object values. Run the full suite and `npm run test-undo` under the harness. Any mismatch is a Phase A bug in the generator, not a reason to loosen the normalizer - this is precisely the gate the ts-morph-v2 branch skipped. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa2
```

### `P3-PA3` — Parity harness, restore leg

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 4 (Parity harness, restore leg) ONLY. Steps 0-3 have landed. Scope fence: do NOT implement step 5, do NOT begin the cutover. The deserializers mutate live state through a completely different mechanism than copyState's hydrator walk, and the point of this unit is that they must not get their first real exercise at cutover. Run the undo suite twice behind a flag - once restoring via the old path, once via the generated deserializers - and compare resulting field values after each rollback, or restore a shadow copy and diff. One specific question this unit exists to ANSWER, and it must be answered explicitly in the evidence: whether -morph's reconcileUpdatedCardZoneMemberships is needed on main. It exists on that branch because of restore-side effects, and a serialize-only comparison structurally cannot tell you. Report the finding either way, because the cutover unit consumes it. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa3
```

### `P3-PA4` — Coverage/staleness cross-check

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase A step 5 (Coverage/staleness cross-check) ONLY. Steps 0-2 have landed (this unit depends on the generator, not on the parity harness, so it may run in parallel with steps 3-4). Scope fence: do NOT begin the cutover. Compare the runtime decorator metadata field set AND per-field kind against the generated serializer's model per class, and HARD-FAIL on any delta. Kinds matter as much as names: once the Phase A parity gate retires, a kind misclassification on a new field would sail through a name-set check and mis-encode silently. This must run both at dev startup and in a spec that force-loads every module containing a registered class - reuse the card-loading path that validate-cards exercises, because decorator metadata materializes at module load, and card-file classes like Bamboozle.ts load only via dynamic card import, so a dev-startup check alone would never see them. The reason this check exists rather than a source-content hash is that it works in a compiled production build where the TS sources are absent. Acceptance requires demonstrating that it FAILS when a field is deliberately hidden from the generator - a green check that cannot go red proves nothing. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pa4
```

### `P3-PB1` — Decorator collection split

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase B step 7 (Value-collection mutation / the stateMap-stateSet-stateArray decorator split) ONLY, sequenced BEFORE the cutover rather than after. All of Phase A has landed and the old system is still authoritative. Scope fence: do NOT delete the state bag, do NOT change IGameSnapshot.states, do NOT touch Phase B steps 1-6 or 8-10. Rationale for doing this now: it is a mechanical sweep across every call site, it is a known -morph TODO, and landing it separately keeps it out of the cutover's diff - which is already the largest in the roadmap. The substance: with live Maps/Sets/arrays in native fields, in-place mutation of a stateValue-typed collection is invisible to the retained setters, since only whole-value reassignment is observed. Give stateMap/stateSet/stateArray wrappers on the ref-collection pattern. This is not load-bearing for full snapshots (serialization reads current contents) but it IS load-bearing for Plan 4, which needs the value-collection hook. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pb1
```

### `P3-PB2` — The cutover

```bash
/orchestrate Implement docs/plans/03-codegen-serializers.md Phase B steps 1 through 5 - the cutover. All of Phase A has landed, the parity harness is green on both legs, the coverage cross-check is in place, and the decorator collection split (step 7) has landed. Scope fence: do NOT do step 8 (retiring the parity harness - that is deferred a release), do NOT do step 9 (docs), do NOT touch Plan 4 work. Steps 6, 7, and 10 have already landed in earlier units. This is an ATOMIC change and cannot be partially landed: deleting the state bag requires the new restore path in the same commit. Five things must all hold. (1) Slim the decorators, delete the bag (GameObjectBase.state, setState, getStateUnsafe, getState), copyState, and the hydration-closure metadata - but KEEP the decorator metadata field-name recording, because the coverage cross-check depends on it. Snapshot order stays remove-then-serialize, which is valid because eager marking stays and serializers are side-effect-free. (2) Game.state moves to the same record format, not left v8-serialized, and its restore DEEP-CLONES the stored record - never assign the retained record by reference, because the live game mutates it in place (winnerNames.push, allCards.push, movedCards.push) and today's freshness guarantee is v8.deserialize. Do NOT go further and make Game.state a GameObject - that is Plan 4. (3) Deserializers assign fields THROUGH the retained accessor setters, never raw backing storage: the setters are what re-wrap UndoArray/UndoMap/UndoSet/UndoSafeRecord and re-latch _hasRef on restore. Get this wrong and after the first rollback every mutable ref collection is a plain array/Map/Set, later pushes never latch, the object is culled at the next snapshot, and the rollback after that dies in getFromUuidUnsafe with SevereHaltGame. Ship the spec that asserts deckZone.deck is still the wrapper type after a rollback. (4) Deserializers must never alias values out of the stored record; ship the double-rollback spec (roll back to the same snapshot twice with mutation in between, assert identical results), and the mutations must include at least one game-level array so the Game.state clone rule is exercised too. (5) oldState for the lifecycle hooks is manufactured at rollback time by running the generated serializer on each live object immediately before overwriting or removing it; retype the hook signatures with the generated ISerialized* interfaces and delete the orphaned I*State bag views. Note explicitly that this is a per-rollback serialize pass main currently avoids by design, and it MUST appear in the benchmark as rollback time including the oldState pass, or the replace-runtime-cost claim is overstated for the rollback path. Preserve the lifecycle contract exactly: afterSetState per object, then removals plus cleanupOnRemove, then afterSetAllState. Include -morph's zone-membership reconciliation only if unit P3-PA3's restore-leg evidence showed it is needed on main - check that evidence rather than assuming. Do NOT run the performance capture; that belongs to unit P3-PB3. task_id: p3-pb2
```

### `P3-PB3` ⏱ — Docs + capture

```bash
/orchestrate-mini Implement docs/plans/03-codegen-serializers.md Phase B step 9 (developer docs) ONLY: update docs/ so the "adding a state field" workflow includes the codegen step, and document the hard-fail behavior when the generated artifact is missing or stale. Scope fence: no production code changes; do NOT retire the parity harness (step 8 is deliberately deferred one release cycle). This is the FINAL scheduled unit of Plan 3: after the docs land, run `npm run benchmark -- --name after-plan-03 --compare initial-performance` and commit both generated files under docs/plans/performance/. Note in the plan doc that Plan 3 is expected to trade build-time complexity for runtime cost, and quantify any headline-benchmark regression rather than waving it through. task_id: p3-pb3
```

### `P3-PB4` — Retire the parity harness *(deferred)*

Phase B step 8 says to keep the harness behind a flag for **one release cycle**,
comparing against committed golden serialized records, then delete it. Do not
schedule this with the rest of Plan 3 — put it on the calendar one release after
`P3-PB2` lands. It is a `/orchestrate-mini` unit when its time comes.

---

## Cross-plan sequencing

Plans 2 and 3 are independent per the roadmap README and *can* run in parallel.
Two notes if you do:

- **Order `P2-A2` before `P3-PA0`.** No hard code conflict — `P2-A2` writes
  save-file encoders that read watcher entries; `P3-PA0` changes how entries are
  stored — but `P2-A2`'s deliverable includes a complete per-watcher field
  inventory that `P3-PA0` would otherwise re-derive. Plan 3 points at Plan 2's
  watcher section for exactly this survey.
- **`P1-A`'s option-1-vs-2 decision is a Plan 5 input.** If Plan 1 lands option 2,
  say so loudly in the plan doc, because Plan 5 stage 5b's wrapper recreation
  recipe assumes option 1's decorated-value subset.

Recommended serial order if you are driving these one at a time:

```
P1-E → P1-C → P1-A → P1-B ⏱
     → P2-B → P2-A → P2-A2 → P2-C1 → P2-C2 → P2-D → P2-E ⏱
     → P3-PA0 → P3-PA1 → P3-PA2 → P3-PA3 → P3-PA4 → P3-PB1 → P3-PB2 → P3-PB3 ⏱
```

`P3-PA4` may run concurrently with `P3-PA2`/`P3-PA3` — it depends on the
generator, not on the parity harness.

---

## Plans 4–6 — not decomposed yet, on purpose

| Plan | Status |
|---|---|
| 4 — Delta snapshots | Blocked on Plan 3. Not decomposed. |
| 5 — GameObject release & recreation | Blocked on Plan 3 and Plan 1 item B. Not decomposed. |
| 6 — Full-fidelity save/load | Blocked on Plans 2, 3, and 5. Not decomposed. |

These three build directly on the serialization surface that Plan 3 replaces
outright. Every file and line reference in their plan docs is anchored to
`7a0526549`, and the decorator layer, the state bag, `copyState`, the hydrators,
and the snapshot record format — the machinery all three of them manipulate —
will all be different code by the time `P3-PB2` lands. Unit boundaries drawn now
would be drawn against machinery that no longer exists.

Three specific handoffs from Plan 3 change how these plans decompose, and none of
their values is known until Plan 3 is done:

- Whether `-morph`'s `reconcileUpdatedCardZoneMemberships` is needed on main
  (answered by `P3-PA3`).
- What the generated per-class `ISerialized*` interfaces actually look like —
  Plan 5's recipe sections and Plan 6's engine-tier records are both written
  against them.
- The schema-surface hash's exact input set, which Plan 6 work item D gates
  engine-tier save compatibility on.

**When Plan 3 is complete, use the prompt in
[`docs/plans/NEXT-DECOMPOSITION-PROMPT.md`](NEXT-DECOMPOSITION-PROMPT.md) to
extend this file with units for Plans 4–6.**
