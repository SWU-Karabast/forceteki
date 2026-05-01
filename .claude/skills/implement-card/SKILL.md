---
name: implement-card
description: >
  Orchestrate the full card implementation workflow for a new Star Wars: Unlimited card.
  TRIGGER when: the user types /implement-card and provides card details (name, aspects, cost, stats,
  traits, abilities). Runs four phases: parallel discovery → plan checkpoint → sequential implementation
  → automated review. Pauses once after planning for user approval, then completes autonomously.
---

You are about to run the card implementation workflow. The user has provided a new card to implement. Follow these four phases in order.

---

## Phase 1 — Discovery (run agents in parallel)

Spawn these two agents **simultaneously in a single message** (use two Agent tool calls in one response):

**Agent A — Explore (codebase patterns):**
```
Search the forceteki codebase for 2-3 existing card implementations that are most similar to this card:

Card details: [insert card details from user]

Find cards that use the same ability types (When Played, On Attack, constant abilities, etc.) and the same base class (NonLeaderUnit, Upgrade, Event, Leader, etc.). For each similar card you find:
- Report the file path
- Quote the relevant setupCardAbilities section
- Note which AbilityHelper methods it uses

Also check AbilityHelper.ts and the relevant GameSystem/OngoingEffect files to confirm the right methods exist for this card's abilities.

Report findings concisely.
```

**Agent B — swu-rules-expert (rules edge cases):**
```
A new card is being implemented for the forceteki simulator. Please check for any rules edge cases, timing interactions, or non-obvious behavior in this card's abilities.

Card details: [insert card details from user]

For each ability, identify:
- Any ambiguous timing (e.g., does "when played" trigger before or after entering play?)
- Keyword interactions (e.g., does this interact with Sentinel, Shielded, Overwhelm?)
- Edge cases a test should cover (e.g., "ability says 'may' — test that player can decline")
- Any relevant official rulings from the admiral Q&A or dev team clarifications

Be concise and implementation-focused.
```

Wait for both agents to complete before proceeding to Phase 2.

---

## Phase 2 — Planning (enter plan mode)

Synthesize the discovery results and enter plan mode. Write a plan that covers:

### Implementation Plan
- **Card class**: which base class to extend and why
- **File path**: `server/game/cards/<SET>/<type>/CardName.ts`
- **Each ability**: how it maps to `registrar.add*` methods, including props structure
- **Engine work needed**: if any — flag explicitly and **stop the workflow here** if engine work is required. Engine changes (new GameSystem, new OngoingEffect type, new StateWatcher) are prerequisites and must be handled separately before implementation proceeds.

### Test Plan
List every test case to implement, one bullet per `it` block:
- ✓ Happy path for each ability
- ✓ Edge cases identified by the rules-expert
- ✓ Cases where player has a choice (can they pass/decline?)
- ✓ Cases where the condition is NOT met (ability should not trigger)

Present this plan and use **ExitPlanMode** to get user approval before proceeding.

---

## Phase 3 — Implementation (after approval, sequential)

### Step 3a: Implement the card
Use the **card-implementer** agent. Provide:
- The full card details
- The approved implementation plan (card class, abilities, file path)

Wait for card-implementer to complete and report the file path.

### Step 3b: Write the tests
Use the **card-test-writer** agent. Provide:
- The full card details
- The approved test plan (all test cases)
- The path to the implementation file from Step 3a

Wait for card-test-writer to complete.

---

## Phase 4 — Review (autonomous)

Run these steps in order:

1. **test-auditor**: Launch the test-auditor agent on the spec file written in Phase 3.

2. **Lint**: Run `npm run lint-fix` on both files:
   ```bash
   npm run lint-fix server/game/cards/<SET>/<type>/CardName.ts
   npm run lint-fix test/server/cards/<SET>/<type>/CardName.spec.ts
   ```

3. **Build and test**: Run the spec file:
   ```bash
   npm test test/server/cards/<SET>/<type>/CardName.spec.ts
   ```

4. **Handle failures**:
   - **Lint errors**: Fix inline.
   - **Test failures from wrong assertions**: Fix inline if clearly wrong (e.g., off-by-one damage, wrong zone name).
   - **Test failures from missing engine behavior**: Report to user — this likely means the card requires engine work that wasn't caught in planning.
   - **Compilation errors**: Fix inline.

---

## Workflow Summary

```
/implement-card [card details]
    │
    ├─ Phase 1: PARALLEL
    │   ├─ Explore agent: find similar cards + ability patterns
    │   └─ swu-rules-expert: check edge cases + interactions
    │
    ├─ Phase 2: CHECKPOINT ← user approves plan here
    │   └─ Implementation plan + test case outline
    │
    ├─ Phase 3: SEQUENTIAL
    │   ├─ card-implementer → writes CardName.ts
    │   └─ card-test-writer → writes CardName.spec.ts
    │
    └─ Phase 4: REVIEW (autonomous)
        ├─ test-auditor → cleans up spec
        ├─ lint-fix → both files
        └─ npm test → run spec, fix failures
```

---

## Engine Work Escalation

If at any point you determine that this card requires new engine infrastructure, **stop and report**:

> **Engine work required before implementation can proceed.**
>
> This card needs: [describe what's needed — e.g., "a new `CaptureDamageSystem` that doesn't exist yet", "a new state watcher for tracking damage dealt this phase"]
>
> Recommend opening a separate task/PR for the engine work first, then returning to implement this card.

Do not try to implement engine infrastructure as part of this workflow.
