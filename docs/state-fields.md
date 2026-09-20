# Engine state fields and the codegen serializers

This document covers `GameObjectBase` state fields: the decorators that make a field
participate in snapshots/rollback, and the build-time code generation step that backs
them since Plan 3 of the [snapshot/undo roadmap](plans/03-codegen-serializers.md).

This is engine-internals material (`server/game/core/`), not card-authoring guidance —
see [`implementing-cards.md`](implementing-cards.md) for that.

## Background

Every engine object extends `GameObjectBase` and declares its rollback-relevant data as
`accessor` fields decorated with one of the `@stateXxx` decorators from
`GameObjectUtils.ts` (`@statePrimitive`, `@stateValue`, `@stateRef`, `@stateRefArray`,
`@stateRefMap`, `@stateRefSet`, `@stateRefRecord`, `@stateMap`, `@stateSet`,
`@stateArray`). The class itself must carry `@registerState()` or
`@registerStateBase()`.

There is no runtime state bag anymore. A decorated field's native backing storage
*is* the state — the decorator keeps a thin setter override (for eager ref marking,
and for mutable ref collections, wrapping the value in `UndoArray`/`UndoMap`/
`UndoSet`/`UndoSafeRecord`), but no longer dual-writes into a separate bag. Snapshot
capture and rollback restore both go through **generated** `serialize<Class>` /
`deserialize<Class>` functions instead of a decorator-metadata walk.

## Adding a new state field

1. **Pick the field kind** based on what the field holds:
   - A primitive or plain JSON-safe value → `@statePrimitive()`.
   - Any other structurally-cloneable value (including nested plain objects, or a
     `Map`/`Set` that is always replaced wholesale, never mutated in place) →
     `@stateValue()`.
   - A reference to another `GameObjectBase` → `@stateRef()`.
   - A collection of references → `@stateRefArray()` / `@stateRefMap()` /
     `@stateRefSet()` / `@stateRefRecord()`.
   - A `Map`/`Set`/`Array` of plain values that call sites mutate in place (push,
     add, delete, etc., not just whole-value reassignment) → `@stateMap()` /
     `@stateSet()` / `@stateArray()`, which wrap the collection the same way the ref
     collections do, so in-place mutation stays observable.
2. **Declare the field as a decorated `accessor`** on a class that is (or inherits
   from) a `@registerState()`/`@registerStateBase()` class.
3. **Build.** The codegen step (`scripts/generate-state-serializers.js`) is prepended
   to every build entry point — `npm run build`, `npm run build-dev`, and
   `npm run build-test` (including its `--fast-build` path, and therefore
   `npm run test`, `test-fast`, `test-parallel`, `test-parallel-undo`, `dev`, and
   plain `tsc`-driven builds too) — so it regenerates
   `server/game/core/generated/GeneratedStateSerializers.ts` automatically whenever
   your change touches it. You do not need to run it by hand in the normal case.
   - The generator caches: on a warm build with no relevant source changes, it reads
     the artifact's header, re-derives the same hash, and exits without loading
     `ts-morph`. Adding or changing a decorated field, or a mixin chain a registered
     class is built from, invalidates that cache and triggers a real (slower)
     regeneration.
   - To inspect the generated model directly (e.g. to confirm your field landed with
     the right kind) without waiting on the build pipeline, run
     `npm run generate-serializers -- --print-model`, which forces a fresh
     generation and prints the per-class field/kind table.
4. **Confirm coverage.** After building, the coverage/staleness cross-check
   (`checkStateSerializerCoverage`, `StateSerializerCoverageCheck.ts`) compares the
   runtime decorator metadata against the generated model, per class, **by field name
   and by field kind**. It runs automatically:
   - At dev-server startup (`server/gamenode/index.ts`, gated on
     `ENVIRONMENT=development`), and
   - In `test/server/core/StateSerializerCoverageCheck.spec.ts`, which force-loads
     every module containing a registered class (the same load-path
     `validate-cards` exercises) so classes that only ever load via dynamic card
     import — e.g. one-off `@registerState` classes declared inside a card file
     under `server/game/cards/**` — are covered too.

   A green run here (or a clean `npm test`) is your confirmation that a new field is
   correctly wired into snapshots and rollback.

## Hard-fail behavior

The standing invariant is that a missing or stale generated artifact must fail loudly,
never degrade silently (see `docs/plans/README.md`, invariant 4). Two distinct failure
modes:

- **Missing generated artifact.** `StateSerializers.ts` imports
  `generated/GeneratedStateSerializers.ts` **non-optionally**. If the file doesn't
  exist (codegen never ran, or its output was deleted — the directory is gitignored),
  that import fails to resolve and the build itself fails with a `tsc` `TS2307`
  error. There is no "no serializers registered, engine falls back to something else"
  path.
- **Stale generated artifact** (a decorated field was added, renamed, or had its kind
  changed, but the artifact wasn't regenerated to match — this shouldn't normally
  happen given step 3 above, but can if the generation cache is bypassed or the
  artifact is hand-edited): `checkStateSerializerCoverage` throws, aggregating every
  mismatch it finds across all classes into one error before failing, in the form:

  ```
  [StateSerializerCoverageCheck] field-model coverage failed for N class(es):
  class "SomeClass": missingFromGenerator=[...] missingFromRuntime=[...] kindMismatches=[...]
  ```

  - `missingFromGenerator` — a field the runtime decorators know about but the
    generated serializer doesn't. This is the dangerous direction: the field would
    silently be excluded from every snapshot and rollback.
  - `missingFromRuntime` — the reverse, a generated field the runtime no longer has
    (e.g. after a rename).
  - `kindMismatches` — same field name, different kind (e.g. a `@stateValue` field
    later changed to `@stateRef`) — this would otherwise mis-encode silently once the
    Phase A parity gate below is gone, since a name-only check can't catch it.

  Separately, a class carrying `@registerState`/`@registerStateBase` with **no**
  corresponding generated entry (and not a known mixin-fragment exclusion) throws
  its own error telling you to run `npm run generate-serializers`.

## The parity harness (temporary, being retired)

A parity harness (`test/helpers/ParityHarness.ts`, `ENABLE_PARITY_HARNESS=true`, run
via `npm run test-parity` / `test-parity-undo`) is kept available for one more release
cycle after the Phase B cutover as an extra safety net — it round-trips every restore
through the generated deserializer and compares against a self-check, and checks
ref-collection wrapper identity after rollback. It is **not** the primary correctness
gate any more (that's `checkStateSerializerCoverage` plus the ordinary test suite) and
is scheduled for removal in a follow-up unit; don't build new reliance on it.
