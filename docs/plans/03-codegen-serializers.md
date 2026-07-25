# Plan 3 — Codegen State Serializers

**Status:** Proposed
**Depends on:** Plan 1 recommended (smaller payload to validate against)
**Unblocks:** Plan 4 (delta hooks live in generated setters), Plan 5 (class registry + per-class serializers), Plan 6 (JSON-safe encoders)
**Shape:** Two phases, each its own PR arc. Phase A is riskless to land; Phase B is the cutover.
**Design references:** `experimental/ts-morph-v2` (architecture), `feature/quick-undo-deltas-morph` (generator with static mixin resolution — the 687-line `scripts/generate-state-serializers.ts` on that branch supersedes v2's), and their plan docs (`docs/plans/generated-state-serializers.md`, `docs/plans/generated-state-serializers-mixin-resolution.md` on those branches). **Reimplement on current main; do not rebase the branches** (~296+ commits of drift in exactly the rewritten files).

## Goal

Replace the runtime cost of the decorator system in `GameObjectUtils.ts` with
build-time generated serializer code:

- Delete the per-object `state` bag and the dual-write in every decorated
  setter (`this.state[name] = ...` alongside the native backing field).
- Delete the `UndoArray`/`UndoMap`/`UndoSet`/`Proxy` collection wrappers from
  the hot path.
- Delete `copyState`'s `Symbol.metadata` prototype-chain walk on restore.
- Remove the `v8.serialize` round-trip for per-GameObject state (snapshots
  hold plain serialized records instead of a Buffer).
- Field decorators become type-level markers only (validation via
  `assertStateAccessorContext`, no accessor override).

Additionally — and deliberately, for Plans 5/6:

- Generated output includes a **class-name-keyed registry**
  (`registerStateSerializers`) — the class-identity infrastructure recreation
  needs.
- Generated serializers emit **JSON-safe encodings** (Maps/Sets → tagged
  arrays) so a serialized state record is a plain JSON document, satisfying
  the standing invariant.

## What the prior branches established (and their gaps to fix)

From `experimental/ts-morph-v2` (working, adopt):
- ts-node generator prepended to `build-dev`/`build-server`/`build-test`,
  emitting `server/game/core/generated/GeneratedStateSerializers.ts` with
  straight-line `serialize<Class>` / `deserialize<Class>` functions and a
  `registerStateSerializers([...])` call.
- Roundtrip spec (`test/server/core/GeneratedStateSerializers.spec.ts`) and a
  perf benchmark harness (`Performance.spec.ts` + `benchmark-snapshots`
  script, gated on `RUN_PERF_BENCHMARKS=1`).

From `feature/quick-undo-deltas-morph` (adopt over v2's version):
- **Static mixin resolution** in the generator
  (`resolveStateNodeFromCallExpression` etc.), resolving
  `WithUnitProperties(WithStandardAbilitySetup(InPlayCard))` chains at build
  time. This matters: v2's runtime prototype-walk composition caused concrete
  exported classes (e.g. `NonLeaderUnitCard`) to generate **empty
  serializers**, a discovered blocker with its own plan doc on that branch.
- Card zone-membership reconciliation on restore
  (`reconcileUpdatedCardZoneMemberships`).

Gaps in both branches that this plan must close:
1. **No parity gate ever ran.** v2 deleted the old system in the same commit
   that introduced the new one; the plan's Phase-2 parity test was never
   written. This plan's Phase A exists precisely to run that gate.
2. **Silent degradation:** `StateSerializers.ts` swallowed `MODULE_NOT_FOUND`
   for the generated module — a missing codegen step degraded to "no
   serializers registered." Must hard-fail instead (standing invariant 4).
3. `stateRefArray`'s `readonly` argument was parsed but ignored — restore the
   distinction or remove the parameter.
4. `-morph`'s `UndoSafeRecord` still asserted against the deleted `go.state`
   (would throw if `@stateRefRecord` were exercised). Audit every residual
   reference to the state bag during cutover; note `stateRefRecord`/
   `stateRefSet` were unused at the time, which is why it never surfaced —
   check current usage on main.
5. Per-class `ISerialized*` interfaces were planned but never emitted
   (everything was `Record<string, unknown>`). Optional; decide in review
   whether type-safety of the generated output is worth generator complexity.
6. `@registerState`'s runtime work (wrapper subclass for auto-`initialize()`,
   parent validation) remains in both branches. Out of scope to remove here —
   it is construction-time, not per-snapshot — but note it for Plan 5, which
   must handle the wrapper-class identity in the registry.

## Phase A — Generator + parity gate (no behavior change)

1. Port the `-morph` generator to current main: scan `@registerState` /
   `@registerStateBase` classes and decorated `accessor` fields; resolve
   mixin chains statically; emit per-class serialize/deserialize plus the
   registry. Generated file stays gitignored; generation runs as a build step
   **and hard-fails the build if missing/stale** (emit a content hash the
   runtime verifies, or make the import non-optional so absence is a compile
   error).
2. Serialized record format: plain JSON-safe objects. Encode:
   - `GameObjectId` refs: as the branded string (already JSON-safe);
   - ref arrays: string arrays (copied, never aliased);
   - `Map`/`Set` state (from `stateRefMap`/`stateRefSet`/Map-valued
     `stateValue` like `AbilityLimit.useCount`): tagged arrays, e.g.
     `{ "$map": [[k, v], ...] }` / `{ "$set": [v, ...] }`;
   - primitives: as-is. Copy semantics must match today's v8-clone (no
     aliasing of live collections into stored records).
3. **Parity harness:** a test-mode hook that, at every snapshot point, runs
   both the existing `getStateUnsafe()`+v8 path and the generated serializer,
   normalizes (Map/Set → sorted arrays), and deep-compares per uuid. Run the
   full suite and `npm run test-undo` under it. Any mismatch is a Phase-A
   bug. This is the gate v2 skipped; Phase B does not start until it is green.
4. Land Phase A with the old system still authoritative.

## Phase B — Cutover

1. Field decorators become no-op markers; native auto-accessor backing fields
   become the storage. Delete the state bag (`GameObjectBase.state`,
   `setState`, `getStateUnsafe`, `getState`), `copyState`, the `Undo*`
   wrapper classes, and the hydration-closure metadata.
2. `IGameSnapshot.states` becomes the serialized-record map (JSON-safe
   objects) instead of a `Buffer`; `Game.state` may stay v8-serialized for now
   or move to the same record format (recommend the latter for uniformity;
   `-morph` went further and made `Game.state` a GameObject — that belongs to
   Plan 4, don't pull it into this cutover).
3. Restore path: per-object `deserialize<Class>(game, instance, record)`
   assigning fields directly, with ref resolution through the existing
   registry lookups. Preserve the lifecycle contract exactly:
   `afterSetState` per object → removals + `cleanupOnRemove` →
   `afterSetAllState` (order documented in `GameStateManager.ts:143-223`).
   Include `-morph`'s zone-membership reconciliation if parity testing shows
   it is needed on main.
4. Keep the parity harness available behind a flag for one release cycle
   (old path preserved in a test shim or snapshot-fixture comparison), then
   delete the old system.
5. Update `docs/` developer docs: "adding a state field" workflow now includes
   the codegen step; document the hard-fail behavior.

## Verification

- Phase A parity gate: full suite + `ENABLE_UNDO_ALL_TESTS=true` with zero
  mismatches.
- Phase B: same suites green; roundtrip spec (serialize → deserialize →
  serialize deep-equal); benchmark harness before/after numbers recorded in
  the PR (snapshot time, restore time, heap).
- A "missing codegen" CI check: build without the generation step must fail.

## Explicit non-goals

- Delta snapshots (Plan 4) — but the generated setters are written knowing
  Plan 4 will add a dirty-tracking hook; keep setter emission centralized in
  the generator so that is a one-place change.
- Removing `@registerState`'s constructor wrapper.
- Recreation/factory work beyond emitting the class-name registry (Plan 5).

## Risks / open questions for reviewer

- **Generated-file policy:** gitignored+build-step (both branches' choice) vs
  committed. Recommend gitignored with hard-fail + CI verification; committed
  files drift and bloat review diffs. Confirm.
- **`Symbol.metadata` polyfill / decorator semantics:** the generator must
  see the same field set the runtime decorators validate; keep
  `assertStateAccessorContext` so a field the generator missed still fails
  loudly at startup in dev.
- **`stateValue` in-place mutation:** with live Maps stored in native fields,
  mutating a Map in place is invisible to any change-detection (a known
  `-morph` TODO proposing `stateMap`/`stateSet`/`stateArray` decorator
  splits). Not load-bearing for full snapshots (serialization reads current
  contents) but becomes load-bearing for Plan 4 — decide here whether to do
  the decorator split now (recommended: yes, in Phase B, while touching every
  call site anyway).
- JSON-record snapshots are larger in memory than v8 buffers. If heap regresses
  materially, an acceptable fallback is JSON-safe *structure* with v8 encoding
  *at rest* (serialize the record map to a Buffer after building it) — keeps
  the invariant (records are JSON-able) while restoring compactness. Measure
  first.
