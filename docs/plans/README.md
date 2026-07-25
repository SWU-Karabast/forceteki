# Snapshot / Undo Architecture Roadmap

This directory contains the plan set for evolving the rollback/snapshot system:
releasable GameObjects, save/load of matches, build-time serializer code generation,
and delta snapshots.

All plans are grounded in a code survey performed against `main` at commit
`7a0526549` (2026-07-25). File and line references throughout the plans are
accurate as of that commit and may drift; treat them as pointers, not gospel.

## Plan index and ordering

| # | Plan | Depends on | Size | Deliverable |
|---|------|-----------|------|-------------|
| 1 | [Snapshot hygiene & enablers](01-snapshot-hygiene.md) | — | Small (several independent PRs) | Memory-growth fixes, RNG seeding, dead-code cleanup |
| 2 | [Semantic save/load v1](02-semantic-save-load.md) | — (Plan 1 recommended first) | Medium | Player-facing save/load at action-window boundaries |
| 3 | [Codegen state serializers](03-codegen-serializers.md) | Plan 1 recommended | Large (two phases) | Build-time generated serializers replacing runtime decorator cost |
| 4 | [Delta snapshots](04-delta-snapshots.md) | Plan 3 | Medium-Large | Quick snapshots as reverse deltas; full snapshots only at phase boundaries |
| 5 | [GameObject release & recreation](05-gameobject-recreation.md) | Plan 3 | Very Large (three stages) | GameObjects can be GC'd and recreated from state |
| 6 | [Full-fidelity save/load](06-full-fidelity-save.md) | Plans 2, 3, 5 | Medium | Save/load converges to a complete JSON state dump |

Dependency chains: `1 → (everything)`, `2` is independent, `3 → 4`, `3 → 5 → 6`,
`2 → 6` (schema continuity). Plans 2 and 3 can proceed in parallel.

## Standing invariants (apply to all plans)

1. **Every piece of game state must be JSON-representable.** State either is
   plain JSON-safe data, or has a registered encoder (Maps/Sets → tagged
   arrays). Enforced by a dev-mode assertion introduced in Plan 2 and by
   generated encoders from Plan 3 onward. New state fields that violate this
   are a review blocker.
2. **Persistent identity uses stable coordinates, never runtime artifacts.**
   Save formats and recreation recipes reference cards by `internalName`/set
   code, abilities by `abilityIdentifier` coordinates, watchers/tokens by their
   enums — never by uuid, registration order, or array index. uuids are a
   runtime concern and may be remapped on load.
3. **Rollback and load both re-enter the pipeline at declared safe points.**
   The `GamePipeline` and `Game.currentlyResolving` are never serialized; the
   existing rollback contract (`Game.postRollbackOperations`) is the template.
4. **No silent degradation.** A missing codegen artifact, an unsupported save
   feature, or a failed parity check must hard-fail loudly, not fall back.

## Prior art: the experimental branches

Several defunct branches serve as design references. **Do not rebase them** —
they are 280–330 commits behind main and touch exactly the files that have
since changed. Reimplement on current main using them as specs.

| Branch | Status | Use as |
|--------|--------|--------|
| `experimental/ts-morph-v2` | Coherent, incomplete gates | Design reference for Plan 3 (generated code, state-bag removal) |
| `feature/quick-undo-deltas-morph` | WIP, best-of-line | Primary design reference for Plans 3 & 4 (static mixin resolution, bufferless deltas, `Game.state` as GameObject); its plan docs (`docs/plans/*` on that branch) are the spec |
| `feature/quick-undo-deltas` | Has a known correctness bug (lost first-write-wins in `DeltaTracker.recordFieldChange`); no tests | Cautionary reference only |
| `feature/quick-undo-deltas-codex`, `-opus` | Failed prototypes | Historical only |
| `feature/undo-json` | Fully superseded (its mechanisms are in main) | Delete |
| `feature/gameobject-family-undo`, `-initialize` | Landed as PR #2179 | Delete |
| `experimental/ts-morph`, `-v1`, `-v1.1` | Superseded by v2 | Historical only |

## Key ground-truth findings the plans build on

- Restore mutates live instances only; there is no construction path in
  rollback (`GameStateManager.rollbackToSnapshot` iterates `allGameObjects`).
- Serialized state records carry no class identity; only cards, tokens, and
  state watchers have id→constructor registries today.
- Ref hydration is fail-fast (`getFromUuidUnsafe` → `SevereHaltGame` on miss).
- `hasRef` is a monotonic latch; nothing tracks reference death, so nothing
  referenced can ever be released.
- Ability/effect objects hold closure-bearing props objects outside state; the
  printed-ability subset is deterministically re-derivable via
  `abilityIdentifier` (`internalName_type_idx`), the gained/dynamic subset is
  not (yet).
- Snapshot cost is O(live objects × retained snapshots): every retained
  object's state is v8-serialized into every snapshot (~13+ live buffers).
- The dominant memory-growth term is `OngoingEffectValueWrapper` churn from
  `DynamicOngoingEffectImpl.recalculateValue()` (up to 10× per game-state
  resolution, each instance permanently pinned).
- The engine is deterministic (seeded `seedrandom`, no `Math.random` in
  `server/`), but production games are constructed unseeded.
- The test suite's `GameStateBuilder` (`test/helpers/GameStateBuilder.js`)
  already implements fresh-start + state-injection — the model for Plan 2.
