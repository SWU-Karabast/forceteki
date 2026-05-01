---
name: Spec File Conventions
description: Formatting patterns, naming rules, and common setup bloat found across spec files
type: feedback
---

## General Structure

- Outer `describe` uses the card's full display name with a colon separator: `describe('Card Name: Subtitle', function() {`
- Inner `describe` identifies the ability type: `'Card\'s on attack ability'`, `'Card\'s undeployed ability'`, `'Card\'s deployed ability'`
- For leader cards, use `'his/her triggered deploy ability'` for the undeployed leader side trigger that deploys Grogu
- For leader cards with multiple deployed-side constant abilities, use `'his/her leader unit side ability: <description>'` to name each describe block
- `it` blocks read as complete statements: `'should deal 2 damage to each enemy unit when played'`
- All `describe` and `it` names must be unique and descriptive — duplicate names are a bug

## Leader Card Deploy Trigger Tests

- When a leader deploys via a triggered ability (not the standard Epic Action), the outer describe is `'his/her triggered deploy ability'`
- Tests inside a `'when <condition>'` sub-describe share a single `beforeEach` for the happy-path condition (e.g. "when a unique unit that costs 4+ is played")
- Negative / boundary tests (wrong card type, cost below threshold, exhausted leader, opponent plays) each get their own inline `setupTestAsync` — they don't share the happy-path `beforeEach`
- The deploy prompt string `'Deploy <CardName>'` should be extracted to a `const` at the top of the shared-`beforeEach` describe only if it's used in 2+ tests in that block; single-use occurrences outside that block use the literal string

## Logical Group Comments

- Add a single-line comment above each logical group (game action, state transition, assertion set)
- Comments are terse and imperative: `// Activate Yularen's ability`, `// Second attack`, `// Trigger fires`
- Do not use comments to narrate what the code obviously does — add them only where context aids scannability

## Setup Bloat

- Common unused cards in player2 setup: `spaceArena: ['tie-advanced']` — frequently included but never referenced
- Common unused cards in player2 setup: `groundArena: ['sundari-peacekeeper']` in describe blocks that have no P2 units in their test bodies
- If player2 has no referenced cards in any test body, omit the `player2` key entirely — do NOT use `player2: {}`
- Empty arrays (e.g., `spaceArena: []`) should be removed entirely — the framework provides sensible defaults
- `player2: {}` is also redundant and should be omitted; the framework initializes player2 by default

## Assertion Bloat

- Asserting 0 damage on every unit not chosen in a "partial selection" test is redundant noise. Assert only the outcomes directly relevant to the test's stated scenario.
- When a test's purpose is to verify that a *specific* set of units is damaged, it is sufficient to assert non-zero damage on the chosen units and zero damage on the one or two units most likely to be confused with chosen ones (if any). Do not enumerate every unit in the game state.
- Exception: if the test explicitly covers "nothing was affected," exhaustively asserting 0 across all units is appropriate.

## Shared vs. Per-Test Setup

- Multiple `it` blocks sharing the same game state should use a single `beforeEach` with `setupTestAsync`
- If a test needs significantly different state (e.g., no units at all vs. a full board), split into separate `describe` blocks each with their own `beforeEach`
- Avoid putting cards in shared setup that are only needed by one test — but if removing them would require a separate `describe`, prefer keeping them in the shared setup

## Scoped Constants

- String constants used in only one `it` block (e.g., prompt text) should be declared inside that `it` block
- String constants used across multiple `it` blocks in the same `describe` should be declared at the top of that `describe` callback (not at the outer `integration` level unless truly shared)

**Why:** Reduces noise at outer scope; makes each test more self-contained and readable.
**How to apply:** Before extracting a constant to a higher scope, confirm it is used in at least two tests at that scope level.

## Keyword + On Attack trigger timing

- `when: { onAttack: true }` in a triggered ability resolves on `EventName.OnAttackDeclared` — the same event Saboteur uses
- This means a unit with both Saboteur and an `On Attack` triggered ability will show the multi-trigger prompt ("You have multiple triggers to resolve. Choose which to resolve first:") when attacking a unit, even if there are no shields present
- When attacking a base, Saboteur does not trigger (it checks `event.attack.getAllTargets().some(target => target.isUnit())`), so only the `On Attack` ability prompts
- When hand is empty, an optional `On Attack` discard ability with a hand card target has no legal targets; whether it still appears in the multi-trigger menu is engine-implementation-specific — do not add speculative comments about this behavior
