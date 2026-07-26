# Adversarial Review — Plan 6 (Full-Fidelity Save/Load)

**Verdict: REJECTED** — the plan's central promise ("the v1 writer's refusal list becomes empty") is unfulfillable with the dependencies it cites, because revised Plan 5 explicitly declined to make resolution-created lasting effects recreatable and handed Plan 6 that exact prerequisite, which Plan 6 never acknowledges or schedules. Second, the load path's identity story (uuid-keyed engine tier, "uuids from file", one-sentence reconciliation of fresh-start objects) both contradicts standing invariant 2 and is mechanically incompatible with Plan 5's rehydration machinery as written. The two-tier shape, the explicit-degradation stance, and the round-trip oracle are genuinely good ideas — but as written this is a plan whose "Medium — convergence and hardening" sizing hides at least one Very-Large-adjacent design problem it inherited in writing and ignored.

---

## Blocker 1 — The plan's premise is dead on arrival: Plan 5 pinned lasting effects instead of making them recreatable, and told Plan 6 so explicitly

**What plan 6 says** (`docs/plans/06-full-fidelity-save.md:13-14, 46-48`): "The v1 writer's refusal list becomes empty" and work item A: "Remove the v1 refusal list check-by-check, each with a round-trip test: duration-bound ongoing effects, gained abilities, delayed effects, custom-duration events" — as if this were mechanical cleanup enabled by Plan 5's "recipes (Plan 5b)".

**What revised Plan 5 actually says** (`docs/plans/05-gameobject-recreation.md:318-335`): resolution-created lasting effects are "**non-recreatable — pinned**"; their props are "resolution data, not definition data"; a parameter-capture recipe is "real design work, **out of scope here and handed to Plan 6 as an open question**." And the open question (`05:508-516`) is blunt: "Plan 6's full-fidelity save of a mid-phase game must serialize them or restrict save points to lasting-effect-free boundaries… If mid-phase saves are required, the parameter-capture recipe… should be scheduled as a Plan 6 prerequisite."

Plan 6 does neither. It contains zero mentions of lasting effects, parameter capture, `matchTarget`, `until` closures, or the pin. Worse, "pinned" is a rollback concept — *keep the live instance in memory*. Across a save/load process boundary there are no live instances; every pinned object is in the recreation set with no recipe. Per Plan 5's own survey (`05:336-349`), 239 card implementations (~13%) create these, `forThisPhaseCardEffect` alone ×217, and they survive action-window boundaries — which are the only save points plan 6 allows (`06:80-84`). The same classification pins `CustomDurationEvent`s whose effect is pinned (`05:363-367`) and function/GameObject-bearing `OngoingEffectValueWrapper`s including `GainAbility`/`AdditionalPhaseEffect` (`05:352-361`). So *four of the four* refusal categories work item A promises to remove lack a recreation story under the plan's stated dependencies.

**Consequence for verification too:** the flagship oracle — "save/load hook at every snapshot point" across the integration suite (`06:94-99`) — would fail or refuse on essentially any position with an active phase-duration effect, i.e. constantly.

**Fix:** add the parameter-capture recipe (resolved-target ref + duration + JSON-safe parameter bag, hard-fail on `until` closures — Plan 5 already sketched it at `05:330-333`) as an explicit, sized work item and prerequisite; state the fallback (writer keeps refusing on `until`-closure effects, ~3 card files today); or restrict full-fidelity saves to end-of-phase timepoints and say so. Any of these is a coherent plan. Silence is not — and re-size the plan accordingly, because "Medium — most machinery exists by now" (`06:5`) is false under any of the three.

## Blocker 2 — The identity/uuid story contradicts invariant 2 and Plan 5's mechanics, and the hardest work item gets one sentence

**What plan 6 says:** the engine tier is uuid-keyed throughout — `"classTagsByUuid"`, `"records": { "<uuid>": ... }`, `"recipes": { "<uuid>": ... }`, `lastGameObjectId` (`06:24-28`); the loader does "register (uuids from file, counter from `lastGameObjectId`)" (`06:60-61`); and fresh-start objects are reconciled "by identity mapping (stable coordinates → uuid)… This mapping is the trickiest part of the plan" (`06:63-66`).

**Problems, in ascending order of severity:**

1. **Invariant 2 conflict, unacknowledged.** README (`docs/plans/README.md:32-36`): "Save formats and recreation recipes reference cards by internalName/set code… never by uuid… uuids are a runtime concern and may be remapped on load." Plan 6 ships a save format keyed by uuid whose loader explicitly does *not* remap ("uuids from file"). Maybe the engine tier deserves an exemption — record-internal refs are uuid-shaped by construction — but a standing invariant doesn't get silently waived; the plan must amend it explicitly or comply (e.g. via a load-time uuid translation table, which is what "may be remapped on load" was designed to permit).

2. **The reconciliation is mechanically impossible as specced.** The fresh-start path (`Game` construction, deck build, setup) organically mints uuids via the global counter (`server/game/core/snapshot/GameStateManager.ts:87-93`: `go.uuid = go.getGameObjectName() + '_' + nextId`). Reconciling a fresh `Card_57` with the file's record means either its fresh uuid already equals the file's — which requires *exact* construction-order determinism between the original game's setup and the loader's headless replay, an assumption the plan never states, justifies, or dev-asserts — or the fresh object must be **rekeyed** to the file's uuid. But uuid assignment is single-assignment (Plan 5 cites the assert at `GameObjectBase.ts:73-76`), and Plan 5's only rekeying mechanism is the scratch→real transition *inside a rehydration scope during rollback* (`05:135-148`). The fresh-start path runs nowhere near a rehydration scope. And it's not just cards: every card's constructor fan-out (abilities, limits, `InitiateAttackAction` — Plan 5 blocker 6, `05:53-63`) got fresh uuids too and each needs rekeying via the composite matching table (`05:259-281`). This is Plan 5b's hardest machinery, applied to a context Plan 5 never designed for, described in plan 6 by "the card-matching approach from Plan 2 extends to it."

3. **Collision hazard either way.** If fresh uuids and file uuids diverge, registering file records trips the occupancy assert Plan 5 adds (`05:141-145`) — or, absent that assert, hits the silent `gameObjectMapping.set` overwrite at `GameStateManager.ts:93` that Plan 5 calls out as the exact bug class to avoid.

**Fix:** specify the mapping as a real design: either (a) a global uuid translation pass — load-time remap of every uuid in every record, recipe, and `stateValue` payload (note this needs Plan 5c's per-field ref extractors, `05:417-429`, for uuid-bearing opaque payloads like watcher entries and `GainAbility._abilityUuidByTargetCard`) — which also dissolves the invariant-2 conflict; or (b) "adopt file uuids" with a specified fresh-object rekeying protocol, an explicit determinism contract for the fresh-start path, and hard asserts on mismatch. Size it as the largest item in the plan, because it is.

## Major 3 — The semantic-tier degradation path is silent state loss wearing an "explicit notice" badge

**What plan 6 says** (`06:34-37, 104-105`): on engine-tier incompatibility the loader "degrades **explicitly** to semantic-tier loading with a user-visible notice — never silently."

**The problem:** in v2 the writer no longer refuses on duration effects, gained abilities, or delayed effects — those facts live *only* in `engineState`. The semantic tier of such a file is lossy by construction, and nothing in plan 6 makes it self-describing about *what* it omits. So the degradation path loads a position that is materially different from the saved game — a unit missing its "+2/+2 for this phase," a granted ability gone — with only a generic notice. That is precisely the "silent degradation" invariant 4 forbids: the notice is explicit, the *specific loss* is invisible, and no check can catch it because the cross-tier dev validation only compares "damage, zones, counts" (`06:50-52`) — none of the effect state. Plan 2 threaded this needle deliberately: its degraded-save discussion demands "an explicit machine-readable list of what was dropped" (`02:474-478`).

**Fix:** the v2 writer must emit, in the semantic tier, a manifest of engine-only facts (category + source card, exactly the data v1's refusal checks already compute — `02:259-272`). The degradation path then presents that list and requires confirmation, or refuses when the manifest is non-empty. Also specify which loader machinery the fallback uses for non-action timepoints if C's restriction-lift lands — Plan 2's load sequence is action-phase-specific (`passedActionPhase` derivation, ActionWindow snapshot seeding, `02:188-243`).

## Major 4 — "Already JSON-safe by construction" is stale against Plan 3: NaN/Infinity will silently corrupt on write

**What plan 6 says** (`06:43-45`): records are "already JSON-safe by construction."

**What Plan 3 actually says** (`03:204-205`): "`NaN`/`Infinity` survive in-memory records but not `JSON.stringify` — flag them in the encoder audit **for Plan 6**." `JSON.stringify(NaN)` emits `null` — silent, type-changing corruption at the exact moment records first hit disk, in the plan whose whole job is disk. Plan 3 shipped this flag *to* plan 6; plan 6 dropped it on the floor. Related: `undefined` inside `stateValue` payload objects is structuredClone-legal (`03:198-203`) but is silently dropped by `JSON.stringify`, which will surface as spurious diffs in the save→load→save deep-equal oracle.

**Fix:** one small, explicit work item: the file writer either hard-fails on non-finite numbers and `undefined`-valued keys (invariant 4) or tag-encodes them (`{"$num":"NaN"}`), with a round-trip test. Cheap now, a debugging nightmare later.

## Major 5 — The schema hash it gates on doesn't exist, and Plan 5's classTag handoff is answered only by accident

**What plan 6 says** (`06:36, 74-75, 121-123`): engine-tier compatibility "is checked by a schema hash emitted by the Plan-3 generator"; open question recommends "generator output."

**What Plan 3 actually emits:** the only hash in Plan 3 is the generation *cache* hash — "hash the candidate set + contents" (`03:184-186`) — a build-input hash that changes on any comment edit or refactor in any candidate file. Used as the compatibility gate, it makes the engine tier same-commit-only, degrading (per Major 3, lossily) on every deploy. A real schema hash must be computed over the semantic surface — classTag → field names/types + recipe shapes — and *nobody's plan currently emits that*. Relatedly, Plan 5's explicit handoff (`05:102-105`): "classTag = TS class name is a runtime coordinate… a class rename silently breaks saves — Plan 6 must add a versioning/aliasing layer over classTag." Plan 6 contains no aliasing layer; its implicit answer is "any change → hash mismatch → semantic fallback." That's a *defensible* position (the plan does argue the semantic tier is the durable format, `06:33-34, 116-119`) — but it should be stated as the answer to the handoff, its consequence acknowledged (a rename bricks the engine tier of every existing save), and it only becomes acceptable once Major 3's manifest makes the fallback honest.

**Fix:** define the hash inputs precisely, add the emission work item (to Plan 3 or here — with a cross-plan note either way), and answer Plan 5's handoff in writing: "no aliasing; hash gates; semantic tier is the durable format" is fine *if said out loud*.

## Major 6 — "Dump every registered GameObject" over-captures snapshot-history garbage, including exactly the objects that can't be recreated

**What plan 6 says** (`06:43-45`): "Dump every registered GameObject's serialized record."

**What the code shows:** the registry retains everything `hasRef` has ever latched — and `hasRef` is a monotonic latch (README `:66-67`); `removeUnusedGameObjects` culls only never-referenced objects (`GameStateManager.ts:98-118`). Until Plan 5c's sweep, `allGameObjects` at save time contains every expired effect, superseded value wrapper, and dead gained-ability object from the whole game — pinned partly *by snapshot history*, which the load then discards (undo-history restart is a non-goal per `02:443`, and plan 6 defers history persistence, `06:67-69`). So the dump embeds, and the loader must recreate, a graveyard of objects the loaded game can never reference — many of them in the non-recreatable families from Blocker 1. Even post-5c the retained-window population is included for nothing.

**Fix:** scope the record set to objects reachable from *live* state (equivalently: what a snapshot taken with cleared history would retain), and dev-assert at write time that nothing outside that set is referenced by any live record. If the snapshot-history stretch goal (`06:67-69`) is ever picked up, it changes this scoping — say so.

## Minor 7 — The restriction-lift claim is technically accurate but incomplete

Plan 6's claim that "the full set… becomes available once the two `throw`ing entry points in `getEntryPointAfterRollback` are implemented" (`06:80-84`) checks out at the entry-point level — exactly two throws, end-of-setup and end-of-regroup (`SnapshotManager.ts:401, 408`); all other timepoints already map. But the entry point is the *easy* half: Plan 2's loader machinery is action-phase-specific (`passedActionPhase` derivation justified only for open action windows, `02:210-217`; ActionWindow-owned snapshot seeding, `02:229-239`). Regroup/setup save points need their own scalar-derivation and injection analysis. Also — glaring omission given Blocker 1 — the **end-of-action-phase** timepoint *already returns a valid entry point* (`SnapshotManager.ts:402-406`) and is exactly the "lasting-effect-free boundary" Plan 5 proposed as the escape hatch (`05:511-513`). Plan 6 frames the restriction-lift purely as "evaluate demand" and never connects it to its own hardest problem.

## Minor 8 — Plan 6 ignores Plan 2's open product question that reshapes its own premise

Plan 2's open question 1 (`02:469-480`) — player-facing button vs bug-report attachment — may flip v1's refusals into degraded saves with a machine-readable dropped-list. If that fork is taken, "the refusal list becomes empty" is no longer plan 6's convergence target; "the degradation manifest becomes empty" is, and the two-tier design should be built around the manifest from day one (which would also solve Major 3). Plan 6 should state which fork it assumes.

## Nit 9 — Data-model drift from revised Plan 5

Plan 5 A1/A4 put `classTag` and the recipe section *inside* each record ("Every serialized state record gains a stable `classTag`", `05:87`; recipe fields go "into a per-class recipe section **of the record**, emitted… by the generated serializer", `05:196-199`). Plan 6 hoists both into separate top-level uuid-keyed maps (`classTagsByUuid`, `recipes`, `06:24-26`). Either converge on Plan 5's in-record layout or note the transform explicitly — as written, the two plans describe two different record shapes for the same bytes.

## Nit 10 — No size or cost numbers anywhere

The plan has no measurement item for dump size (a full record set per save, plus semantic tier) or writer latency, and the verification corpus ("fresh-process… at every snapshot point" of the integration suite, `06:94-99`) is acknowledged as expensive only via "budget CI time." Add a numbers item; every other plan in this set earned its sizing with measurements.

---

## What I'd ask the author

1. **Which of the three exits from the lasting-effect wall are you taking** — parameter-capture recipes as a scheduled prerequisite, a permanent residual refusal list (`until`-closure effects), or end-of-phase-only full saves? Plan 5 put the question to you in writing; the plan currently pretends it wasn't asked, and every downstream claim (empty refusal list, "Medium" sizing, the every-snapshot-point oracle) changes depending on the answer.
2. **Adopt file uuids or remap them?** "uuids from file" requires rekeying every fresh-start object and its constructor fan-out through machinery Plan 5 only built for rollback scopes, plus an unstated determinism contract; a load-time uuid translation table complies with invariant 2 and avoids all of it, at the cost of rewriting refs inside opaque `stateValue` payloads (which Plan 5c's ref extractors already inventory). Which one, and why?
3. **What is the semantic-tier fallback actually for**, given that by v2 the semantic tier is lossy by construction and the loss is currently unrecorded? If the answer is "it must carry a machine-readable engine-only-facts manifest," that manifest — not the empty refusal list — is arguably the real convergence artifact of this plan.
