# Forceteki card & test authoring guide

Deep, copy-paste reference for implementing cards and writing their specs. The repo `CLAUDE.md`
(auto-loaded) covers commands, architecture, gotchas, and conventions — read it first. This file
holds the fuller templates and API surface that the card-implementer / card-test-writer / test-auditor
agents consume on demand.

---

## Implementing cards

### File layout

```
server/game/cards/<SET>/<type>/CardName.ts
test/server/cards/<SET>/<type>/CardName.spec.ts
```

Sets: `01_SOR`, `02_SHD`, `03_TWI`, `04_JTL`, `05_LOF`, etc. Types: `units`, `upgrades`, `events`, `leaders`.

### Card class hierarchy

Cards use TypeScript mixin composition. Primary base classes:

- `NonLeaderUnitCard` — standard units
- `LeaderUnitCard` — leaders (two-sided; `setupLeaderSideAbilities` + `setupLeaderUnitSideAbilities`). Extend `LeaderUnitCard`, never `LeaderCard`.
- `UpgradeCard` — upgrades
- `EventCard` — events
- `BaseCard` — bases
- `TokenUnitCard`, `TokenUpgradeCard` — tokens

Property mixins (`WithUnitProperties`, `WithCost`, `WithDamage`, etc.) compose behavior onto these base classes.

### Card template

```typescript
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CardName extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1234567890',          // from test/json/_cardMap.json
            internalName: 'card-name#subtitle'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({ ... });
        registrar.addConstantAbility({ ... });
        registrar.addActionAbility({ ... });
    }
}
```

**Do not import `AbilityHelper`** — it is injected as the second parameter to `setupCardAbilities`.
Importing it directly will cause issues.

**Base class selection:**

| Card type | Base class | Import path |
|-----------|-----------|-------------|
| Standard unit | `NonLeaderUnitCard` | `../../../core/card/NonLeaderUnitCard` |
| Leader | `LeaderUnitCard` | `../../../core/card/LeaderUnitCard` |
| Upgrade | `UpgradeCard` | `../../../core/card/UpgradeCard` |
| Event | `EventCard` | `../../../core/card/EventCard` |

**Registrar method reference:**

- `registrar.addTriggeredAbility({ title, when, optional?, targetResolvers?, immediateEffect, ... })`
- `registrar.addConstantAbility({ title, condition?, matchTarget, ongoingEffect })`
- `registrar.addActionAbility({ title, cost, optional?, targetResolvers?, immediateEffect, ... })`

### Leaders

Leaders override `setupLeaderSideAbilities(registrar, AbilityHelper)` for the horizontal leader side
and `setupLeaderUnitSideAbilities(registrar, AbilityHelper)` for the deployed unit side (both required).
**Shared ability props between both sides must be built from a method call, not a class field** — the
props object is mutated during setup, so a shared field object causes bugs.

### Keywords

Keywords are parsed from card data automatically — do **not** write `registrar` calls for printed
keywords (Saboteur, Overwhelm, Sentinel, Shielded, Ambush, Raid, Grit, Restore, etc.). Exceptions that
DO require implementation:

1. **Conditionally granted keywords** ("this unit gains Sentinel while upgraded") — `registrar.addConstantAbility`
   using `AbilityHelper.ongoingEffects.grantKeyword(...)`.
2. **Bounty / Coordinate** — embed an ability definition and must be explicitly registered. Rare; find an example.

### Ability helpers

Reachable from the injected `AbilityHelper`:

- `AbilityHelper.immediateEffects.*` → `GameSystem` implementations (damage, defeat, draw, exhaust, …) in
  `server/game/gameSystems/` (`GameSystemLibrary.ts`). Each has `canAffect()` (called repeatedly; must
  return true *every* time for the target to be legal) and `eventHandler()`. First place to debug an
  ability that triggers but does nothing.
- `AbilityHelper.ongoingEffects.*` → `OngoingEffectLibrary.ts`; used by constant abilities; apply/remove is automatic.
- `AbilityHelper.costs.*` → `CostLibrary.ts`.
- `AbilityHelper.stateWatchers.*` → phase-scoped event history (`StateWatcherLibrary.ts`); declare watchers
  in `setupStateWatchers(registrar, AbilityHelper)`.

---

## Writing tests

### Test template

```typescript
describe('Card Name: Subtitle', function() {
    integration(function(contextRef) {
        describe('its ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['card-name'],
                        groundArena: ['wampa'],
                        leader: { card: 'some-leader', deployed: true }
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should do X', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.cardName);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
            });
        });
    });
});
```

### Key test APIs

**Setup:** `contextRef.setupTestAsync(options)` — always `await`ed. Only one call per test case (the harness
throws if both a `beforeEach` and the body call it).

**Card references:** auto-referenced on `context` in camelCase by internal name (`cartel-spacer` →
`context.cartelSpacer`). Always available: `context.p1Base`, `context.p2Base`, `context.p1Leader`,
`context.p2Leader`. Duplicate identical names generate no prop — use `player.findCardByName()` /
`findCardsByName()`. (See `test-conventions/conventions_card_naming.md` for the subtitle rule.)

**Player actions:** `player.clickCard(card)`, `player.clickPrompt(text)`, `player.passAction()`,
`player.setResourceCount(n)`.

**Assertions:**
- `expect(card).toBeInZone('discard')` — prefer over `card.zoneName`
- `expect(player).toBeAbleToSelectExactly([...])` — exact selectable card set
- `expect(card).toHaveExactUpgradeNames([...])` — upgrades on a card
- `expect(player).toHavePrompt(text)`, `toHaveEnabledPromptButton(text)`
- `expect(player).toHavePassAbilityButton`, `toHavePassAbilityPrompt`
- `expect(player).toBeActivePlayer()`
- `expect(card.damage).toBe(n)` — prefer attacking `p2Base` when asserting damage/power output, since a
  defeated unit no longer shows counters

**Phase helpers:** `this.moveToNextActionPhase()` — fast-forward through regroup.

**Gold-standard example:** `test/server/cards/07_LAW/units/VermillionQirasAuctionHouse.spec.ts`.

### Coverage guidance

- One `describe` per ability, one `it` per case. Happy path + negative cases + edge cases.
- Printed keywords do not need their own test cases — they're covered by the keyword's own suite. Only test
  a keyword when it's the specific interaction under test.
- When unsure about prompt text, trigger ordering, or timing windows, consult `swu-rules-expert` before
  writing the assertion — a wrong assertion is worse than a missing one.

---

## Key conventions

- **`context.source` over `this`:** in ability handlers use `context.source` / `context.player`, not `this` /
  `this.controller`, to get the correct card/player at resolution time.
- **Upgrade abilities:** when a gained ability targets the attached card, `context.source` is the _attached
  unit_, not the upgrade.
- **State watchers:** record the _acting player_ at event time (e.g., `playedBy`), not `controller`, which may
  change via control-switching effects.
- **`override` keyword:** all overrides must be `public override` / `protected override` (`noImplicitOverride`).
- **`import type`:** all type-only imports must use `import type` (ESLint-enforced).
- **Custom lint rules** (`server/game/**`): `no-raw-token-text` (use `TextHelper` constants, never raw
  aspect/trait/keyword/cost strings), `state-ref-array-requires-istatearray`, `no-event-generated-tokens`
  (read `resolvedEvents[...]?.generatedTokens`).
