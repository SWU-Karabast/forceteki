---
name: karaplan
description: "Plan the implementation of a new Star Wars Unlimited card, ability enhancement, or bug fix in the forceteki engine. Use this skill whenever a developer wants to implement a card, add an ability, refactor card behavior, or debug a broken card. Triggers on: 'implement [card name]', 'plan [card]', 'how do I code [ability]', 'add [feature] to a card', '[card] is broken', 'fix [card] bug', or any mention of wanting to write or fix a card."
---

# karaplan

Plan a forceteki card implementation, enhancement, or bug fix using parallel research agents.

## Step 0: Gather requirements

Before doing anything else, ask the developer for:
1. **Card name** (and internal name if known, e.g. `boba-fett#disintegrator`)
2. **Full printed ability text** (exact wording from the card)
3. **Task type**: New card implementation, Enhancement to existing card, or Bug fix

Then check `test/json/Card/` for a JSON file matching the card name.

- If the file **is missing**: First delete the contents of the `build/` directory (run `rm -rf build/*`), then run `npm run get-cards` to fetch fresh data. Check again.
  - If still missing after that, show the developer the `buildMockCard` entry they need to add to `scripts/mockdata.js`, then run `npm run get-cards` again.
  - Do NOT manually create or edit any files in `test/json/`.
- If the file **is found**: Read it to get: card ID (the `id` field — a string like `'some-card-id'`), type, cost, power/hp, traits, aspects, and any printed keywords.

Once you have card text and data, proceed immediately.

## Step 1: Detect mode

- **Simple card**: 1-2 abilities, no cross-card interaction → 3 agents
- **Complex enhancement**: Multi-ability, cross-card interactions, state tracking → 4 agents
- **Bug fix**: Existing card misbehaves or a test is failing → 3 agents (different focus)

## Step 2: Launch agents

Launch all agents in a **single message**. All `subagent_type: "Explore"` (read-only). Agent count matches mode.

---

### Simple card — 3 agents

**Agent A — Similar card implementations**
Search `server/game/cards/` for 2-3 cards using the same registrar method. Read them fully.
Return: file paths, registrar methods, notable patterns (targetResolver, optional, limit, ifYouDo, condition).

**Agent B — API surface**
Read: `AbilityRegistrationInterfaces.ts`, `GameSystemLibrary.ts`, `OngoingEffectLibrary.ts` (if constant ability), `CostLibrary.ts` (if activation cost), `Constants.ts` (relevant enums).
Return: correct registrar interface + immediateEffects/ongoingEffects/cost API for this card.

**Agent C — Test patterns**
Find 1-2 specs for similar cards in `test/server/cards/`. Read them fully. Also read `docs/testing-cards.md` and `docs/test-cheat-sheet.md`.
Return: spec structure, interaction flow, matchers used, edge case patterns.

---

### Complex enhancement — 4 agents

Agents A, B, C as above, plus:

**Agent D — State watchers and interaction patterns**
Read `server/game/stateWatchers/`. Search for cards using stateWatchers or complex chains (aggregateWhen, nested ifYouDo). Read 1-2 in full.
Return: which watcher fits, how setupStateWatchers is overridden, how watcher is queried.

---

### Bug fix — 3 agents

**Agent A** — Read the broken card file + spec + `docs/debugging-guide.md`. Return step-by-step summary of what the code does.

**Agent B** — Find 2-3 correctly-implemented cards with the same pattern. Return specific differences vs the broken card.

**Agent C** — Read the relevant game system file (DamageSystem.ts, TriggeredAbility.ts, etc.). Return how it works and most likely bug cause.

---

## Step 3: Synthesize and propose tests

### [Mode]: [Card Name]

**Card text:** [exact text]
**Card data:** type, cost, power/hp, traits, aspects, keywords

**Files:**
- Implementation: `server/game/cards/[SET]/[type]/[ClassName].ts`
- Test spec: `test/server/cards/[SET]/[type]/[ClassName].spec.ts`

**mockdata.js entry** (new cards only — then run `npm run get-cards`):
```javascript
buildMockCard({
    title: '[Title]',
    power: N, hp: N, cost: N,
    hasNonKeywordAbility: true,
    aspects: ['[aspect]'],
    types: ['unit'],
    traits: ['[trait]'],
    setId: { set: 'ASH', number: NNN },
    unique: false,
    arena: 'ground',
    internalName: '[internal-name]',
}),
```

**Base class / registrar:** `[ClassName] extends [BaseClass]` using `I[X]AbilityRegistrar`

**Key API:** registrar method, immediateEffects, any ongoing/cost/watcher

**Reference cards:** path — pattern demonstrated

---

### Suggested test cases

Before generating the full spec skeleton, propose a list of test cases for the developer to review. Format as a numbered list with a short name and what the test verifies:

```
1. Happy path — [describe the main success scenario]
2. [Edge case] — [describe what boundary/interaction is covered]
3. [Edge case] — [describe another boundary]
...
```

**Default test setup context** (no need to specify unless overriding):
- Player 1 leader: **Darth Vader - Dark Lord of the Sith** (`darth-vader#dark-lord-of-the-sith`)
- Player 2 leader: **Luke Skywalker - Faithful Friend** (`luke-skywalker#faithful-friend`)
- Player 1 base: `kestro-city` | Player 2 base: `administrators-tower`
- Configured in `test/helpers/DeckBuilder.js` — override per-test with `player1: { leader: '...' }`

**Ask the developer:** "Do these test cases look right? Add, remove, or adjust any before I generate the full plan."

Wait for the developer's response before proceeding to Step 4.

---

## Step 4: Generate full plan

After the developer confirms (or adjusts) the test list, output the complete plan.

---

### Skeleton Implementation

```typescript
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { I[X]AbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { [BaseClass] } from '../../../core/card/[BaseClass]';

export default class [ClassName] extends [BaseClass] {
    protected override getImplementationId() {
        return { id: '[ID from card JSON]', internalName: '[internal-name]' };
    }

    public override setupCardAbilities(registrar: I[X]AbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.[method]({
            title: '[ability title]',
            // optional: true,
            // targetResolver: { cardTypeFilter: WildcardCardType.Unit, immediateEffect: ... },
            immediateEffect: AbilityHelper.immediateEffects.[effect]({ /* ... */ }),
        });
    }
}
```

---

### Skeleton Test Spec

Generate the full spec using the confirmed test case list. Use real card names and the default leader/base setup. Structure:

```typescript
describe('[Card Name]', function () {
    integration(function (contextRef) {
        describe('[ability description]', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['[internal-name]'], groundArena: [] },
                    player2: { groundArena: [] }
                });
            });

            it('[test case 1 name]', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.[cardName]);
                expect(context.player2).toBeActivePlayer();
            });

            it('[test case 2 name]', function () {
                const { context } = contextRef;
                // ...
            });
        });
    });
});
```

---

## Step 5: Validate changes

Once implementation and tests are written:

1. **Run the linter first:**
   ```
   npm run lint
   ```
   Fix any lint errors before proceeding.

2. **Run the card's unit tests:**
   ```
   NODE_ENV=test node --enable-source-maps node_modules/jasmine/bin/jasmine --config=./jasmine.json --filter="[Card Name]"
   ```

3. **If more than one card was modified**, also run the full test suite to check for regressions:
   ```
   npm run test-parallel
   ```
