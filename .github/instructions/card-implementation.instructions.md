---
applyTo: "server/game/cards/**/*.ts"
---

# Card Implementation

These instructions apply to implementing new card abilities.

> **Note**: These instructions were created with a narrow scope of use cases and may be incomplete or naive in some areas. When you complete a new card implementation and discover new patterns, edge cases, or best practices, please update this file with that context and learnings.

## File Structure & Naming

- Card files are organized under `server/game/cards/` grouped by set
- Set directories use the format `NN_CODE/` (e.g., `01_SOR/`, `07_TS26/`)
- Within each set, cards are grouped by type: `units/`, `events/`, `upgrades/`, `leaders/`, `bases/`, `tokens/`
- File names are PascalCase matching the class name exactly: `FleetLieutenant.ts`, `FivesIHaveProof.ts`
- Class names are PascalCase with the subtitle appended (no separator): `GroguIrresistible`, `DarthVaderTwilightOfTheApprentice`

## Card Class Structure

### Base Classes

Each card type has a specific base class:

| Card Type                    | Base Class           | Registrar Type                         |
|------------------------------|----------------------|----------------------------------------|
| Unit (non-leader, non-token) | `NonLeaderUnitCard`  | `INonLeaderUnitAbilityRegistrar`       |
| Event                        | `EventCard`          | `IEventAbilityRegistrar`               |
| Upgrade                      | `UpgradeCard`        | `IUpgradeAbilityRegistrar`             |
| Base                         | `BaseCard`           | `IBaseAbilityRegistrar`                |
| Leader                       | `LeaderUnitCard`     | `ILeaderUnitLeaderSideAbilityRegistrar` / `ILeaderUnitAbilityRegistrar` |

### Minimal Card Template

```typescript
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CardName extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1234567890',
            internalName: 'card-name#subtitle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // Abilities go here
    }
}
```

### Implementation ID

Every card must override `getImplementationId()` returning `id` and `internalName`. Find these values in `test/json/_cardMap.json`.

### Exports

Cards use `export default class` — the class is the default export.

## Ability Types & Registration Methods

All abilities are registered in `setupCardAbilities()`. The registrar provides methods for each ability type:

### Triggered Abilities

```typescript
// When Played - triggers when the card is played
registrar.addWhenPlayedAbility({
    title: 'Description of the effect',
    optional: true, // Add for "may" abilities
    // ... effect properties
});

// When Defeated - triggers when the card is defeated
registrar.addWhenDefeatedAbility({
    title: 'Description of the effect',
    // ... effect properties
});

// On Attack - triggers when the card attacks
registrar.addOnAttackAbility({
    title: 'Description of the effect',
    // ... effect properties
});

// Generic triggered ability with custom trigger
registrar.addTriggeredAbility({
    title: 'Description of the effect',
    when: { /* trigger conditions */ },
    // ... effect properties
});
```

### Action Abilities

```typescript
registrar.addActionAbility({
    title: 'Description of the action',
    cost: AbilityHelper.costs.exhaustSelf(), // Common cost
    targetResolver: {
        controller: RelativePlayer.Opponent,
        immediateEffect: AbilityHelper.immediateEffects.exhaust()
    }
});
```

### Constant Abilities

```typescript
// Self-targeting constant ability
registrar.addConstantAbility({
    title: 'While this unit is exhausted, it gains +1/+1',
    condition: () => this.exhausted,
    ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
});

// Targeting other cards
registrar.addConstantAbility({
    title: 'Each Rebel unit gains +1/+1',
    matchTarget: (card) => card.hasSomeTrait(Trait.Rebel),
    ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
});
```

### Event Abilities

Event cards use `setEventAbility` (singular — only one event ability per card):

```typescript
registrar.setEventAbility({
    title: 'Defeat a non-leader unit',
    targetResolver: {
        cardTypeFilter: WildcardCardType.NonLeaderUnit,
        immediateEffect: AbilityHelper.immediateEffects.defeat()
    }
});
```

### Pre-Enter Play Abilities

For effects that must resolve before a card enters play (e.g., Clone, Fives). Only available on cards that have `WithPreEnterPlayAbilities` in the mixin chain (units, leaders, upgrades).

```typescript
registrar.addPreEnterPlayAbility({
    title: 'Description of what happens before entering play',
    optional: true,
    targetResolver: {
        activePromptTitle: 'Choose a unit',
        cardTypeFilter: WildcardCardType.Unit,
        cardCondition: (card, context) => card !== context.source && /* conditions */,
        immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
            duration: Duration.Custom,
            until: {
                onCardLeavesPlay: (event, context) => event.card === context.source,
            },
            target: context.source,
            effect: [ /* ongoing effects */ ]
        })),
    },
});
```

**Important**: Cards using `addPreEnterPlayAbility` with effects that need `getAbilityRegistrar()` (like `CopyStandardTriggeredAbilitiesEffect` or `CloneUnitEffect`) must expose it publicly:

```typescript
public override getAbilityRegistrar(): INonLeaderUnitAbilityRegistrar {
    return super.getAbilityRegistrar();
}
```

### Leader Abilities

Leaders have two sides with separate ability registration methods:

```typescript
export default class SomeLeader extends LeaderUnitCard {
    // Leader side (undeployed) abilities
    protected override setupLeaderSideAbilities(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addActionAbility({ /* ... */ });
    }

    // Unit side (deployed) abilities
    protected override setupLeaderUnitSideAbilities(
        registrar: ILeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addConstantAbility({ /* ... */ });
    }
}
```

### Upgrade Abilities

Upgrades commonly target the attached unit:

```typescript
// Constant ability on attached unit
registrar.addConstantAbilityTargetingAttached({
    title: 'Attached unit cannot attack bases',
    ongoingEffect: AbilityHelper.ongoingEffects.cannotAttackBase(),
});

// Gain keyword on attached unit
registrar.addGainKeywordTargetingAttached({
    keyword: KeywordName.Restore,
    amount: 2
});

// Gain triggered ability on attached unit
registrar.addGainOnAttackAbilityTargetingAttached({
    title: 'On Attack: Do something',
    // ... effect properties
});
```

## Target Resolvers

Target resolvers define how targets are selected for an ability:

```typescript
targetResolver: {
    activePromptTitle: 'Choose a target',     // Custom prompt text
    controller: RelativePlayer.Opponent,       // Who controls the target
    cardTypeFilter: WildcardCardType.Unit,     // Filter by card type
    zoneFilter: WildcardZoneName.AnyArena,     // Filter by zone
    cardCondition: (card, context) => /* bool */, // Custom filter
    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
}
```

### Target Filtering Constants

- **Controllers**: `RelativePlayer.Self`, `RelativePlayer.Opponent`, `WildcardRelativePlayer.Any`
- **Card Types**: `WildcardCardType.Unit`, `WildcardCardType.NonLeaderUnit`, `CardType.BasicUnit`, etc.
- **Zones**: `WildcardZoneName.AnyArena`, `ZoneName.GroundArena`, `ZoneName.Hand`, `ZoneName.Discard`, etc.

## Common Ongoing Effects (AbilityHelper.ongoingEffects)

```typescript
// Stat modification
AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 1 })

// Keyword manipulation
AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Sentinel)

// Trait manipulation
AbilityHelper.ongoingEffects.gainTrait(Trait.Clone)
AbilityHelper.ongoingEffects.loseTrait(Trait.Rebel)

// Ability manipulation
AbilityHelper.ongoingEffects.gainAbility(abilityPropsWithType)
AbilityHelper.ongoingEffects.loseAllAbilities()

// Card copying effects
AbilityHelper.ongoingEffects.cloneUnit(targetUnit)              // Copy ALL printed attributes and abilities
AbilityHelper.ongoingEffects.copyStandardTriggeredAbilities(    // Copy a specific standard triggered ability type
    targetUnit, StandardTriggeredAbilityType.WhenPlayed)        // (WhenPlayed, WhenDefeated, OnAttack, OnDefense)

// Printed attribute override (used by Clone)
AbilityHelper.ongoingEffects.overridePrintedAttributes({ title, power, hp, ... })

// Attack restrictions
AbilityHelper.ongoingEffects.cannotAttackBase()
AbilityHelper.ongoingEffects.cannotAttack()
AbilityHelper.ongoingEffects.mustAttack()
```

## Common Immediate Effects (AbilityHelper.immediateEffects)

```typescript
AbilityHelper.immediateEffects.damage({ amount: 2 })
AbilityHelper.immediateEffects.defeat()
AbilityHelper.immediateEffects.exhaust()
AbilityHelper.immediateEffects.ready()
AbilityHelper.immediateEffects.drawCard({ amount: 1 })
AbilityHelper.immediateEffects.giveShield()
AbilityHelper.immediateEffects.playCardFromHand()
AbilityHelper.immediateEffects.returnToHand()
AbilityHelper.immediateEffects.cardLastingEffect({ ... })
AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: ... })
AbilityHelper.immediateEffects.useWhenPlayedAbility()
AbilityHelper.immediateEffects.optional({ title: '...', innerSystem: ... })
AbilityHelper.immediateEffects.simultaneous({ gameSystems: [...] })
```

## Common Costs (AbilityHelper.costs)

```typescript
AbilityHelper.costs.exhaustSelf()
AbilityHelper.costs.resourceCost(2)
AbilityHelper.costs.defeatSelf()
```

## Key Enums & Constants

Commonly imported from `'../../../core/Constants'`:

- `Duration` — `Custom`, `Persistent`, `UntilEndOfPhase`, `UntilEndOfRound`, `WhileSourceInPlay`, `UntilEndOfAttack`
- `Trait` — `Rebel`, `Imperial`, `Clone`, `Jedi`, `Sith`, `Vehicle`, `Trooper`, `Spectre`, etc.
- `KeywordName` — `Sentinel`, `Ambush`, `Restore`, `Raid`, `Smuggle`, `Overwhelm`, `Saboteur`, etc.
- `WildcardCardType` — `Unit`, `NonLeaderUnit`, `Upgrade`, `Any`, `Playable`, etc.
- `RelativePlayer` — `Self`, `Opponent`
- `WildcardZoneName` — `Any`, `AnyArena`, `AnyAttackable`
- `ZoneName` — `GroundArena`, `SpaceArena`, `Hand`, `Deck`, `Discard`, `Resource`, `Base`

## Keywords

Keywords (Sentinel, Raid, Smuggle, etc.) are **automatically parsed** from card text. Do not implement them explicitly unless they are conditional:

```typescript
// Only needed for conditional keywords like:
// "While you have initiative, this unit gains Sentinel."
registrar.addConstantAbility({
    title: 'While you have initiative, this unit gains Sentinel',
    condition: (context) => context.source.controller.hasInitiative(),
    ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
});
```

## Creating New Effects

When a card needs a new ongoing effect not yet in the library:

### 1. Create the effect class

Place in `server/game/core/ongoingEffect/effectImpl/`. Follow the pattern of existing effects like `CloneUnitEffect` or `GainAbility`:

```typescript
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { registerState } from '../../GameObjectUtils';

@registerState()
export class MyNewEffect extends OngoingEffectValueWrapperBase<ValueType> {
    public constructor(game: Game, value: ValueType) {
        super(game, value, effectDescription);
    }

    public override apply(target: IUnitCard): void {
        super.apply(target);
        // Apply the effect to the target
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);
        // Clean up the effect from the target
    }
}
```

### 2. Add the EffectName constant

In `server/game/core/Constants.ts`, add a new entry to the `EffectName` enum:

```typescript
export enum EffectName {
    // ... existing entries ...
    MyNewEffect = 'myNewEffect',
}
```

### 3. Register in OngoingEffectLibrary

In `server/game/ongoingEffects/OngoingEffectLibrary.ts`, add the factory method:

```typescript
import { MyNewEffect } from '../core/ongoingEffect/effectImpl/MyNewEffect';

// In the export object:
myNewEffect: (param: ParamType) =>
    OngoingEffectBuilder.card.static(EffectName.MyNewEffect, (game) => new MyNewEffect(game, param)),
```

## Patterns & Recipes

### State Watchers

State watchers track game state changes over time (e.g., cards played this phase, units defeated this round). Register them in `setupStateWatchers` and store as instance properties for use in any ability:

```typescript
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
    this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase();
}
```

Once registered, the watcher is available in any ability callback — cost reduction, triggered abilities, conditions, etc. Browse `AbilityHelper.stateWatchers` and `server/game/stateWatchers/` for available watchers.

See also: `VanguardAce`

### Cost Reduction (Decrease Cost Abilities)

Use `addDecreaseCostAbility` to reduce a card's own play cost. The `amount` can be a static number or a dynamic function `(card, player) => number`:

```typescript
registrar.addDecreaseCostAbility({
    title: 'Description of cost reduction',
    amount: 2,                              // Static reduction
    condition: (context) => /* bool */,      // Optional: only active when true
});

registrar.addDecreaseCostAbility({
    title: 'Description of cost reduction',
    amount: (_card, player) => /* number */, // Dynamic reduction based on game state
});
```

See also: `ResoluteUnderAnakinsCommand`

### Lasting Effects (Scoped by Duration)

Lasting effects apply an ongoing effect for a limited duration. Each variant scopes to a different timeframe:

| Immediate Effect | Duration | Typical Use |
|---|---|---|
| `forThisPhaseCardEffect` | Until end of phase | Stat buffs/debuffs, granting keywords |
| `forThisRoundCardEffect` | Until end of round | Preventing ready, removing abilities |
| `forThisAttackCardEffect` | Until end of attack | Combat-only stat modifications |
| `forThisPhasePlayerEffect` | Until end of phase | Player-level effects (e.g., cost reduction) |

**Card-targeting lasting effects** (`forThisPhaseCardEffect`, `forThisRoundCardEffect`, `forThisAttackCardEffect`) can be used in two forms:

Static form — target comes from the enclosing `targetResolver`:
```typescript
targetResolver: {
    cardTypeFilter: WildcardCardType.Unit,
    controller: RelativePlayer.Opponent,
    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
    })
}
```

Callback form — target specified explicitly:
```typescript
immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
    target: context.game.getArenaUnits({ otherThan: context.source })
}))
```

**Player-targeting lasting effects** (`forThisPhasePlayerEffect`) apply to a player, not a card. When no `target` is specified, it defaults to the controller:
```typescript
immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
    effect: AbilityHelper.ongoingEffects.decreaseCost({
        cardTypeFilter: WildcardCardType.Unit,
        amount: 1
    })
})
```

HP modifications via lasting effects are purely temporary — stats fully restore when the duration ends. Units reduced to 0 HP are defeated immediately.

See also: `Disarm`, `RallyingCry`, `NoGoodToMeDead`, `SithTrooper`, `GNKPowerDroid`

### Targeting Multiple Units

To apply an effect to many units at once, use the callback form of a lasting effect with an explicit `target` array. Gather targets with `getArenaUnits()`:

| Call | Scope |
|---|---|
| `context.player.getArenaUnits()` | All friendly units |
| `context.player.getArenaUnits({ trait: Trait.X })` | Friendly units with a trait |
| `context.player.opponent.getArenaUnits()` | All enemy units |
| `context.game.getArenaUnits()` | All units (both players) |
| `context.game.getArenaUnits({ otherThan: context.source })` | All units except source |

This pattern works with any lasting effect variant.

### Copying Abilities from Another Card

Two existing mechanisms:

1. **Clone all abilities + attributes** (`cloneUnit`): Used by Clone card. Copies everything — stats, traits, keywords, and all abilities. Requires `isClone()` to return `true` on the target card.

2. **Copy specific standard triggered abilities** (`copyStandardTriggeredAbilities`): Used by Fives. Accepts a `StandardTriggeredAbilityType` parameter (e.g., `WhenPlayed`, `WhenDefeated`, `OnAttack`, `OnDefense`) to determine which abilities to copy. Creates a filtered registrar that only allows the matching registration method through, then calls `setupCardAbilities()` with it.

Both follow the same general pattern:
- Snapshot existing ability UUIDs on the target before applying
- Call `setupCardAbilities()` from the source card using the target's registrar
- On unapply, remove only the newly-added abilities (those not in the snapshot)

### Optional Abilities ("may" keyword)

Add `optional: true` to the ability properties. For triggered abilities, this shows a "Trigger" / "Pass" button. For target resolvers within abilities, this allows "Choose nothing".

### Lasting Effects Until Card Leaves Play

```typescript
AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
    duration: Duration.Custom,
    until: {
        onCardLeavesPlay: (event, context) => event.card === context.source,
    },
    target: context.source,
    effect: [ /* effects array */ ]
}))
```

### Initiating Attacks from Abilities

```typescript
registrar.addWhenPlayedAbility({
    title: 'Attack with a unit',
    optional: true,
    initiateAttack: {
        attackerLastingEffects: {
            effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
            condition: (attack) => attack.attacker.hasSomeTrait(Trait.Rebel)
        }
    }
});
```

## Important Conventions

1. **Title property**: Every ability needs a `title` string describing what it does. This is used in prompts and logs.

2. **Import paths**: Use relative imports from the card file. Standard imports for a unit:
   ```typescript
   import type { IAbilityHelper } from '../../../AbilityHelper';
   import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
   import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
   ```

3. **Type imports**: Use `import type` for interfaces and types that are only used in type positions.

4. **No `implemented` flag**: Despite what the docs say, actual card implementations in the codebase do NOT set a static `implemented = true` property. Do not add one.

5. **Card data JSON**: Card data files live in `test/json/Card/` as `{internalName}.json`. These are generated by `npm run get-cards` — do not create or edit them manually.

6. **Test requirement**: Every new card must have at least one test file. See the card-tests instructions for testing conventions.

7. **Mock card data**: For unreleased cards, add entries to `scripts/mockdata.js` using `buildMockCard()`, bump the version in `card-data-version.txt`, and run `npm run get-cards` to regenerate JSON. Upgrade mocks must set `hp: 0` and `power: 0` (not omitted) — the `UpgradeCard` constructor asserts these are non-null.
