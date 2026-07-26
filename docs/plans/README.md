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
| 1 | [Snapshot hygiene & enablers](01-snapshot-hygiene.md) | — | Small (4 small PRs — items A, B, C, E; item B after item A; item D is prerequisite-only, not scheduled) | Memory-growth fixes, RNG seeding, dead-code cleanup |
| 2 | [Semantic save/load v1](02-semantic-save-load.md) | — (Plan 1 recommended first) | Medium | Bug-report save/load artifact at action-window boundaries; unrepresentable state degrades with an `engineOnlyFacts` manifest |
| 3 | [Codegen state serializers](03-codegen-serializers.md) | Plan 1 recommended | Large (two phases) | Build-time generated serializers replacing runtime decorator cost; schema-surface hash for Plan 6 |
| 4 | [Delta snapshots](04-delta-snapshots.md) | Plan 3 | Medium-Large | Quick snapshots as reverse deltas; full snapshots only at phase boundaries |
| 5 | [GameObject release & recreation](05-gameobject-recreation.md) | Plan 3; Plan 1 item B | Very Large (three stages: 5a infrastructure + leaf recreation, 5b composite recreation + closure recipes — cards/tokens live here, not 5a — 5c release policy) | GameObjects can be GC'd and recreated from state |
| 6 | [Full-fidelity save/load](06-full-fidelity-save.md) | Plans 2, 3, 5 | Large | Two-tier save: semantic tier + full engine-state records; inherits Plan 2's `engineOnlyFacts` manifest and drives it to empty |

Dependency chains: `1 → (everything)`, `2` is independent, `3 → 4`, `3 → 5 → 6`,
`2 → 6` (schema continuity); Plan 5 additionally hard-depends on Plan 1 item B
(uuid counter restore + rollback registration guard) and coordinates with
Plan 4 (rehydration-scope carve-out, delta-payload removal records). Plans 2
and 3 can proceed in parallel.

## Standing invariants (apply to all plans)

1. **Every piece of game state must be JSON-representable.** State either is
   plain JSON-safe data, or has a registered encoder (Maps/Sets → tagged
   arrays). Enforced by a dev-mode assertion introduced in Plan 2 and by
   generated encoders from Plan 3 onward. New state fields that violate this
   are a review blocker. Two clarifications: in-memory records may carry
   non-finite numbers, which the file tier tag-encodes as `$num` (Plans 3/6);
   and values that genuinely cannot be represented (function-typed wrapper
   values, resolution-created lasting-effect props) live *outside* decorated
   state as plain fields and are explicitly classified and pinned by Plan 5 —
   the invariant governs decorated state, never a license to smuggle closures
   into it.
2. **Persistent identity uses stable coordinates, never runtime artifacts.**
   Save formats and recreation recipes reference cards by `internalName`/set
   code, abilities by `abilityIdentifier` coordinates, watchers/tokens by their
   enums — never by uuid, registration order, or array index. uuids are a
   runtime concern and may be remapped on load. (Plan 6's engine tier
   exercises exactly the remap clause: its records are keyed by
   file-internal ids that are never matched against live uuids — identity
   matching uses stable coordinates only, and every ref is rewritten through
   a load-time translation table.)
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
- `OngoingEffectValueWrapper` growth from
  `DynamicOngoingEffectImpl.recalculateValue()` has two distinct terms (Plan 1
  item A): wrappers are allocated up to 10× per game-state resolution, but only
  a wrapper stored on an *actual value change* is permanently pinned — the rest
  are transient churn, swept by `GameStateManager.removeUnusedGameObjects` at
  every timepoint. The permanent term is one wrapper per value change per
  target.
- The engine is deterministic (seeded `seedrandom`, no `Math.random` in
  `server/`), but production games are constructed unseeded.
- The test suite's `GameStateBuilder` (`test/helpers/GameStateBuilder.js`)
  already implements fresh-start + state-injection — the model for Plan 2.
