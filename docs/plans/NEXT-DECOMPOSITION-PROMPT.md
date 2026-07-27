# Decomposition prompt for Plans 4–6

Use this **after unit `P3-PB3` lands** (Plan 3 complete, `after-plan-03` capture
committed). It extends
[`IMPLEMENTATION-ORDER.md`](IMPLEMENTATION-ORDER.md) with units for Plans 4, 5,
and 6.

This is **not** an `/orchestrate` invocation. Orchestrate implements; this is a
survey-and-decompose task that produces a doc. Paste it into a fresh Claude Code
session in this repo.

---

## The prompt

```
Plan 3 (docs/plans/03-codegen-serializers.md) is complete. Extend
docs/plans/IMPLEMENTATION-ORDER.md with implementation units for Plans 4, 5,
and 6, following the exact conventions that file already establishes for Plans
1-3: one unit = one orchestrate run = one staged diff = one commit gate; a unit
table with dependencies, size, risk, and route; a per-unit fenced invocation
carrying an explicit scope fence; and the performance capture assigned to
exactly one final unit per plan.

Do NOT write implementation plans. This is decomposition only - a backlog. Each
unit's actual handoff gets written by the Anvil plan stage immediately before it
is implemented, against the code as it exists then. Do not implement anything.

## Step 1: re-anchor the plans to current main

Every file and line reference in docs/plans/04-*.md, 05-*.md, and 06-*.md is
anchored to commit 7a0526549 and is now stale - Plan 3 replaced the decorator
layer, deleted the state bag and copyState, changed the snapshot record format,
and changed how Game.state is stored. Before decomposing anything, survey what
actually exists now and report the drift. At minimum, establish the current
state of:

- The generated serializer module: its path, its per-class ISerialized*
  interface shape, and how the registry maps class names to serializers.
- The schema-surface hash: exactly which inputs feed it, and where it is
  exported from. Plan 6 work item D gates engine-tier save compatibility on it.
- The retained decorator setters and the stateMap/stateSet/stateArray split:
  these are the hook points Plan 4 needs for delta recording. Confirm the
  override bodies are still centralized in GameObjectUtils.ts as Plan 3's
  non-goals section required, and confirm the per-field encoders are still
  individually addressable so Plan 4's delta values can reuse them.
- The rollback lifecycle after the cutover: the afterSetState / removals +
  cleanupOnRemove / afterSetAllState order, and how oldState is now
  manufactured.
- Whether -morph's reconcileUpdatedCardZoneMemberships was found necessary on
  main. Unit P3-PA3's evidence bundle answers this; read it rather than
  re-deriving it. Plan 4's rollback protocol and Plan 5's recreation path both
  care.

Report the drift as a short list of "the plan says X at line N; it is now Y."
Do not silently correct the plan docs - the drift list is an output, and I will
decide which plan docs to amend.

## Step 2: resolve the open decisions that gate decomposition

Three things in these plans are explicitly unresolved, and each one changes the
unit boundaries rather than merely the contents of a unit. For each, either
resolve it from evidence now available post-Plan-3, or make it the FIRST unit
of its plan (a spike whose deliverable is the decision plus its evidence).
State which you chose and why.

- Plan 4's "Decision checkpoint: full deltas vs per-object memoization." This
  is the largest fork in Plan 4 and the downstream units differ substantially
  between the two branches.
- Plan 4's "Open issues inherited from -morph (must be resolved, not carried)."
  Enumerate each, and say whether it is resolvable from the current code or
  needs its own unit.
- Plan 1 work item A's option 1 vs option 2 outcome. Check what actually landed.
  Plan 5 stage 5b's OngoingEffectValueWrapper recreation recipe assumes option
  1's decorated-value subset; if option 2 landed, 5b carries extra state-
  modelling work and you must size it accordingly.

## Step 3: decompose

Plan 4 (docs/plans/04-delta-snapshots.md) - Medium-Large. Natural seams to
consider: the delta mechanism and recording hooks; chain selection, contiguity
and eviction; the rollback protocol; cadence and the anchor-snapshot contract;
manual snapshots and the whole-suite gate. Note that Plan 2's loader already
depends on the anchor contract (Plan 4's startTracking asserts an anchor
snapshot exists, and after a load the tracker must not start until the first
full snapshot is taken) - Plan 2 has landed by now, so verify the loader
actually honors it rather than assuming.

Plan 5 (docs/plans/05-gameobject-recreation.md) - Very Large, and the plan
already declares three stages: 5a lifecycle infrastructure + leaf-family
recreation, 5b composite recreation + closure recipes (cards and tokens live
in 5b, NOT 5a), 5c release policy. Each stage is far too big for one unit -
5a alone spans A1 factory registry, A2 rehydration scopes, and A4 recipe
sections. Decompose within stages. Two hard dependencies to carry into the
fences: Plan 5 requires Plan 1 item B (uuid counter restore + the rollback
registration guard), and Plan 5's A2 rehydration scopes RELAX item B's
unconditional guard to "registration outside an active rehydration scope
hard-fails" - that carve-out is Plan 5 work, and the unit that lands it must
say so, because it is loosening a guard another plan deliberately shipped
tight. Plan 5 also coordinates with Plan 4 on the rehydration-scope carve-out
and delta-payload removal records; if Plan 4 has not landed, the fences must
name that coupling.

Plan 6 (docs/plans/06-full-fidelity-save.md) - Large, with work items A-G
already enumerated. Item A (lasting-effect parameter capture) is called out as
"the wall Plan 5 handed over" - check whether Plan 5's stage 5b closure recipes
already discharged part of it before sizing it. Item C (loader identity mapping
and restoration) is named the largest item and almost certainly needs splitting.
Item G (refactor the three until-closure card files) is small and standalone -
it can run early and independently rather than last. Plan 6 inherits Plan 2's
engineOnlyFacts manifest, repurposed to declare engine-tier-only facts, and its
goal is to drive the non-capturable residue to empty; the units should make
that residue measurable rather than asserted.

## Step 4: cross-plan sequencing

Update the "Cross-plan sequencing" section with the 4/5/6 ordering, the
recommended serial order, and any units that can genuinely run concurrently.
Replace the "Plans 4-6 - not decomposed yet" section with the real tables.

## Constraints on your output

- Sizes and risk markers are scheduling estimates using the Anvil vocabulary
  (Small|Medium|Large, green/yellow/red). Say so; the plan stage's own
  classification wins at run time.
- Assign each plan's performance capture to exactly one final unit, and have
  every other invocation explicitly forbid running it. The capture commands are
  `npm run benchmark -- --name after-plan-NN --compare initial-performance`.
- Do not edit an existing benchmark scenario or redefine a headline benchmark
  (manager/*, payload/*, sustained/*) in any unit without the fence saying so
  explicitly - Plan 4 in particular is expected to pressure this, since it
  changes what a snapshot IS.
- Keep task_ids in the established shape: p4-*, p5a-*, p5b-*, p5c-*, p6-*.
- Where a plan carries a decision that a later plan depends on, put it in the
  fence as "settle this at the plan gate, not during implementation" - the same
  way P1-A's invocation handles the option 1 vs 2 choice.

Ask me about anything genuinely ambiguous before writing. Then write the
extended IMPLEMENTATION-ORDER.md.
```

---

## Why this waits for Plan 3

Decomposing 4–6 now would produce unit boundaries drawn against the state bag,
`copyState`, the hydrator walk, and the v8 snapshot record format — all of which
Plan 3 deletes. The three concrete handoffs listed at the bottom of
`IMPLEMENTATION-ORDER.md` (the `reconcileUpdatedCardZoneMemberships` answer, the
generated `ISerialized*` shapes, and the schema-surface hash input set) have no
known values until `P3-PB2` lands, and all three change how these plans split.
