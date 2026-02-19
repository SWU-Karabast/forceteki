---
applyTo: "test/server/cards/**/*.spec.ts"
---

# Card Ability Unit Tests

These instructions apply to card ability unit tests.

> **Note**: These instructions were created with a narrow scope of use cases and may be incomplete or naive in some areas. When you complete a new test case and discover new patterns, edge cases, or best practices, please update this file with that context and learnings.

## File Structure & Naming

- Test files are named `{CardName}.spec.ts` matching the card's implementation file
- Tests are organized by set in subdirectories (e.g., `01_SOR/`, `02_SHD/`, `07_LAW/`)
- Card types have their own subdirectories: `units/`, `events/`, `upgrades/`, `leaders/`, `bases/`

## Test Setup Pattern

Always use `contextRef.setupTestAsync()` with `async function` and `await`:

```typescript
describe('Card Name', () => {
    integration(function(contextRef) {
        describe('Ability Name', function() {
            it('should do something', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'some-leader#subtitle',
                        hand: ['card-name'],
                        groundArena: ['unit-name'],
                        spaceArena: ['ship-name'],
                        deck: ['card-in-deck'],
                        discard: ['card-in-discard'],
                        resources: 5 // or specific cards: ['card1', 'card2']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;
                // Test logic here
            });
        });
    });
});
```

### Card References

- Cards are referenced using internal names with hyphens: `battlefield-marine`, `vermillion#qiras-auction-house`
- Unique cards use `#` to specify subtitle: `bossk#deadly-stalker`
- Access cards via context: `context.battlefieldMarine`, `context.vermillion`, `context.bossk`
- Card names are converted to camelCase without the subtitle

### Setup with Upgrades or Deployed Leaders

```typescript
groundArena: [{ card: 'unit-name', upgrades: ['upgrade-name'] }],
leader: { card: 'leader-name#subtitle', deployed: true, upgrades: ['upgrade'] }
```

### Using beforeEach for Shared Setup

When multiple tests share the same setup:

```typescript
describe('Cases with a single setup', function() {
    beforeEach(async function() {
        await contextRef.setupTestAsync({
            phase: 'action',
            player1: { /* ... */ },
            player2: { /* ... */ }
        });
    });

    it('test case 1', function() {
        const { context } = contextRef;
        // Test logic (no async/await needed here)
    });

    it('test case 2', function() {
        const { context } = contextRef;
        // Different test logic
    });
});
```

## Common Test Patterns

### Test Structure and Comments

Keep tests readable with concise comments separating logical steps. Each block typically represents a player action and its expected outcome. Avoid excessive comments - let the code speak where possible.

```typescript
it('creates 2 credits for the opponent in this scenario', function() {
    const { context } = contextRef;

    // Attack with Vermillion
    context.player1.clickCard(context.vermillion);
    context.player1.clickCard(context.p2Base);

    // Ability triggers, choose a deck to reveal from
    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
    context.player1.clickPrompt('Your deck');

    // Card is revealed
    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
    context.player1.clickDone();

    // Choose yourself to play the card
    context.player1.clickPrompt('You');
    context.player1.clickPrompt('Trigger');

    // Card is played for free, opponent gets credits
    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
    expect(context.player1.exhaustedResourceCount).toBe(0);
    expect(context.player2.credits).toBe(2);
});
```

Use inline comments sparingly for non-obvious callouts:

```typescript
expect(context.player1.exhaustedResourceCount).toBe(2); // Paid aspect penalty
```

### Player Actions

```typescript
context.player1.clickCard(context.someCard);      // Click a card to play/select it
context.player1.clickPrompt('Button Text');       // Click a prompt button
context.player1.clickDone();                      // Click the "Done" button
context.player1.passAction();                     // Pass the current action
context.player1.chooseListOption('Option Name');  // Select from dropdown list
```

### Assertions

```typescript
// Zone/location assertions
expect(context.card).toBeInZone('groundArena', context.player1);
expect(context.card).toBeInZone('discard');
expect(context.card).toBeInZone('deck', context.player2);

// Prompt assertions
expect(context.player1).toHavePrompt('Prompt Title');
expect(context.player1).toHaveExactPromptButtons(['Button1', 'Button2']);
expect(context.player1).toHavePassAbilityPrompt('Play Card Name for free');

// Card display prompts (for reveal effects)
expect(context.player1).toHaveExactViewableDisplayPromptCards([context.card1, context.card2]);

// Selection assertions
expect(context.player1).toBeAbleToSelectExactly([context.card1, context.card2]);

// Active player
expect(context.player2).toBeActivePlayer();

// Card state
expect(context.card.exhausted).toBeTrue();
expect(context.card.damage).toBe(3);
expect(context.card.getPower()).toBe(5);
expect(context.card.getHp()).toBe(4);

// Upgrades
expect(context.unit).toHaveExactUpgradeNames(['upgrade-name']);
expect(context.upgrade).toBeAttachedTo(context.unit);

// Resources and Credits
expect(context.player1.exhaustedResourceCount).toBe(0);
expect(context.player1.credits).toBe(5);
```

### Triggering Optional Abilities

```typescript
// For optional "may" abilities
expect(context.player1).toHavePassAbilityPrompt('Ability Description');
context.player1.clickPrompt('Trigger');  // To trigger
context.player1.clickPrompt('Pass');     // To decline
```

### Attacking

```typescript
context.player1.clickCard(context.attacker);
context.player1.clickCard(context.defender);  // Or context.p2Base for base attack
```

## Important Test Considerations

### Aspect Penalties

Each player has a leader (usually 2 aspects) and a base (usually 1 aspect). Playable cards have a printed cost and 0 or more aspects. If all of a card's aspects are represented by the player's leader + base, they pay the printed cost. Otherwise, they pay +2 resources for each missing aspect.

**Example**: `bossk#deadly-stalker` is [Cunning, Villainy] with printed cost 5. With a [Cunning, Heroism] leader and [Vigilance] base, Bossk costs 7 (5 + 2 for missing Villainy).

**When testing costs explicitly** (e.g., verifying `exhaustedResourceCount`), always ensure the leader/base combination covers the card's aspects to avoid unexpected penalties. If testing aspect penalties themselves, intentionally use mismatched aspects.

```typescript
player1: {
    leader: 'the-client#please-lower-your-blaster', // Cunning, Villainy
    hand: ['bossk#deadly-stalker'], // Also Cunning, Villainy - no penalty
}
```

#### Aspect Reference

For most typical scenarios, if an aspect is relevant to the test, you can use one of the following leaders and/or bases. Keep in mind, however, any tests that need to specifically test a leader and/or base ability may require a different leader/base choice. Consider these "stock" choices when reaching for specific aspects.

**Bases** (typically 1 aspect):
- Vigilance: `dagobah-swamp`
- Command: `echo-base`
- Aggression: `kestro-city`
- Cunning: `chopper-base`

**Leaders** (typically 2 aspects):
- Vigilance, Heroism: `luke-skywalker#faithful-friend`
- Command, Heroism: `captain-rex#fighting-for-his-brothers`
- Aggression, Heroism: `sabine-wren#galvanized-revolutionary`
- Cunning, Heroism: `kazuda-xiono#best-pilot-in-the-galaxy`
- Vigilance, Villainy: `iden-versio#inferno-squad-commander`
- Command, Villainy: `emperor-palpatine#galactic-ruler`
- Aggression, Villainy: `darth-vader#dark-lord-of-the-sith`
- Cunning, Villainy: `rio-durant#wisecracking-wheelman`

### "Friendly" Unit Restrictions

When a player plays another player's card with "Attach to a friendly unit" or similar restrictions, "friendly" is relative to the player playing the card, not the card's owner.

### Play Restrictions

Cards with play restrictions (e.g., blocked by Regional Governor) will automatically skip the play step if the restriction applies - no prompt is shown.

### Empty Targets

When an ability requires a target but none are valid (e.g., an upgrade with no valid units), the ability automatically skips - no prompt is shown.

### Piloting Units

Units with Piloting show multiple play options:

```typescript
expect(context.player1).toHaveExactPromptButtons(['Play Unit Name', 'Play Unit Name with Piloting']);
```

### Cards Played "For Free"

When cards are played for free, verify no resources were spent:

```typescript
expect(context.player1.exhaustedResourceCount).toBe(0);
```

### Testing when an ability has no effect (fizzles)

When an ability fizzles (i.e., does not trigger, does not resolve, or resolves with no effect), the behavior depends on the ability type:

**On-attack abilities** that fizzle are skipped silently with no prompt:

```typescript
// Attack triggers on-attack ability, but it fizzles - no prompt shown
context.player1.clickCard(context.attacker);
context.player1.clickCard(context.p2Base);

// No further prompts, immediately opponent's turn
expect(context.player2).toBeActivePlayer();
```

**Action abilities** that fizzle show a "no effect" confirmation prompt:

```typescript
// Use ability that will have no effect
context.player1.clickCard(context.leaderWithActionAbility);
expect(context.player1).toHaveNoEffectAbilityPrompt('Ability description text');
context.player1.clickPrompt('Use it anyway');  // Or 'Cancel' to abort

// Cost is paid but ability has no effect
expect(context.leaderWithActionAbility.exhausted).toBeTrue();
```

### Leader Testing Patterns

#### Deployed vs Undeployed Setup

```typescript
// Start with leader undeployed (default)
leader: 'anakin-skywalker#protect-her-at-all-costs'

// Start with leader already deployed
leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true }
```

#### Manually Deploying a Leader

When testing a leader's deployed abilities, you may want to manually deploy within the test to verify the leader counts as "entered play this phase":

```typescript
// With 5+ resources, clicking the leader shows deploy option
context.player1.clickCard(context.anakinSkywalker);
context.player1.clickPrompt('Deploy Anakin Skywalker');
```

To avoid the deploy prompt when testing leader-side action abilities, use fewer resources than the deploy cost:

```typescript
player1: {
    leader: 'anakin-skywalker#protect-her-at-all-costs',  // 5-cost leader
    resources: 4,  // Can't afford to deploy, so action ability is used directly
}
```

### Token Units

Token units (e.g., X-Wings, Clone Troopers) are created by card abilities and count as regular units for most purposes.

#### Finding Token Units

```typescript
// Find a token unit created during the test
const xwing = context.player1.findCardByName('xwing');
expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
```

#### Tokens and "Entered Play" Conditions

Token units count toward "entered play this phase" conditions. For example, playing Veteran Fleet Officer creates an X-Wing token - both count as having entered play.

### Control Changes and "Friendly" Evaluation

When abilities reference "friendly units," this is evaluated at resolution time based on current control, not based on who originally played the unit:

- A unit you played but gave to your opponent (e.g., via Galen Erso's ability) does NOT count as friendly
- A unit your opponent played but gave to you DOES count as friendly

```typescript
// P1 plays Galen Erso and gives control to P2
context.player1.clickCard(context.galenErso);
context.player1.clickPrompt('Trigger');  // Give opponent control

// Later, P1's ability targeting "friendly units" cannot target Galen
```

### "Entered Play This Phase" Conditions

Abilities that check if units "entered play this phase" typically require the unit to still be in play:

- Units that entered play but were defeated no longer count
- Current control matters, not who played the unit
- Token units count equally with regular units

## Edge Cases to Consider (in no particular order)

1. **Empty zones**: What happens when deck/hand/arena is empty
2. **Cost 0 cards**: Ensure 0 no resources are spent
3. **Nested play effects**: Events that play other cards (e.g., Sneak Attack/Home One/Kelleran Beq -> another Unit)
4. **Cross-player card plays**: Player A playing from Player B's deck/discard pile/resource zone
5. **Upgrade targeting**: Friendly restrictions, vehicle restrictions, valid targets
6. **Control changes**: Units that change control mid-phase (e.g., Galen Erso, Change of Heart) - "friendly" is evaluated at ability resolution, not when the unit entered play
7. **Optional abilities**: Triggering vs passing on "may" abilities, and ensuring correct prompts and game state changes in both cases
8. **Defeated units**: Units that entered play but were defeated before an ability resolves may not count for "entered play this phase" conditions
9. **Token units**: Ensure token units are handled correctly for targeting, counting, and zone checks

## Using xdescribe and xit to temporarily skip tests

When writing new tests or modifying existing ones, you may want to temporarily skip certain test cases or entire describe blocks. Use the following patterns:

- Use `xdescribe` to skip an entire describe block
- Use `xit` for placeholder tests not yet implemented
- Remove the `x` when tests are ready to run

## Running Tests

```bash
npm test test/server/cards/path/to/CardName.spec.ts
```
