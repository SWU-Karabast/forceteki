# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Forceteki is a server-side implementation of the **Star Wars: Unlimited (SWU)** card game rules, forked from Ringteki. It runs a Socket.io + Express server that the [Karabast frontend](https://github.com/SWU-Karabast) connects to. All rule enforcement, card abilities, and turn structure are handled server-side.

---

## Commands

### Setup
```bash
npm install          # install dependencies
npm run get-cards    # fetch card JSON data (required before running tests)
```

### Build
```bash
npm run build        # production build → build/server/
npm run build-test   # build server + test dirs in parallel (used by npm test)
```

> If files were added/renamed/deleted since the last build, run `rm -r build/` first — TypeScript incremental build does not remove stale output.

### Testing (Jasmine)
```bash
npm test                                              # full build + all tests
npm run test-fast <file>                              # skip rebuild (use when build is current)
npm run test-fail-fast                                # stop on first failure
npm run test-parallel                                 # 4 parallel workers
```

**Run a specific test file:**
```bash
npm test test/server/cards/01_SOR/units/SomeCard.spec.ts
npm test "**/SomeCard.spec.*"                         # glob (must be shell-quoted)
```

### Linting
```bash
npm run lint         # errors only
npm run lint-verbose # include warnings
npm run lint-fix     # auto-fix
```

---

## Architecture

### Server Structure

```
server/game/
├── core/               # Engine primitives
│   ├── Game.ts         # Root game object; event emitter and pipeline driver
│   ├── GamePipeline.ts # Stack-based step executor
│   ├── Constants.ts    # All enums (ZoneName, EventName, CardType, Keyword, etc.)
│   ├── ability/        # Ability type classes
│   ├── attack/         # Attack flow (AttackFlow, Attack, AttackHelpers)
│   ├── card/           # Card class hierarchy and mixin composition
│   ├── event/          # GameEvent and EventWindow (trigger resolution happens here)
│   ├── gameSteps/      # Pipeline steps: phases, prompts, ability resolution
│   ├── ongoingEffect/  # Ongoing effect engine
│   ├── snapshot/       # Undo/rollback system
│   ├── stateWatcher/   # Base state watcher infrastructure
│   └── zone/           # Zone classes (Hand, Deck, Arena, Resource, etc.)
├── cards/              # All card implementations, organized by set (01_SOR, 02_SHD, etc.)
├── gameSystems/        # Atomic state mutations: DamageSystem, DefeatCardSystem, DrawSystem, etc.
├── ongoingEffects/     # Persistent effect implementations (OngoingEffectLibrary.ts)
├── costs/              # Cost implementations (CostLibrary.ts)
├── stateWatchers/      # Phase-scoped event history (StateWatcherLibrary.ts)
├── actions/            # High-level actions: PlayUnitAction, InitiateAttackAction, etc.
├── AbilityHelper.ts    # Central registry; injected into all card setupCardAbilities calls
├── Interfaces.ts       # All ability prop interfaces
└── TargetInterfaces.ts # Target resolver type definitions
```

### Game Flow

**Action phase:** `ActionWindow` alternates players → player selects an ability → `AbilityResolver` is queued in `GamePipeline` → costs checked → targets chosen → costs paid → `GameSystem.resolve()` executes → `GameEvent`s fire → `TriggeredAbilityWindow` checks all registered `when` conditions → matching triggered abilities queued for resolution.

**Events:** `GameEvent` objects are collected into an `EventWindow`. After all events in a window resolve, a `TriggeredAbilityWindow` fires.

### Card Class Hierarchy

Cards use TypeScript mixin composition. The primary base classes are:

- `NonLeaderUnitCard` — standard units
- `LeaderUnitCard` — leaders (two-sided; has `setupLeaderSideAbilities` + `setupLeaderUnitSideAbilities`)
- `UpgradeCard` — upgrades
- `EventCard` — events
- `BaseCard` — bases
- `TokenUnitCard`, `TokenUpgradeCard` — tokens

Property mixins (`WithUnitProperties`, `WithCost`, `WithDamage`, etc.) compose behavior onto these base classes.

### Card Registration

`server/game/cards/Index.ts` auto-discovers all `.js` files under `server/game/cards/**` (skipping `_`-prefixed files and `common/` directories). Each file exports a default card class with `getImplementationId()` returning `{ id, internalName }`. The card ID comes from `test/json/_cardMap.json`.

---

## Implementing Cards

### File Layout

```
server/game/cards/<SET>/<type>/CardName.ts
test/server/cards/<SET>/<type>/CardName.spec.ts
```

Sets: `01_SOR`, `02_SHD`, `03_TWI`, `04_JTL`, `05_LOF`, etc. Types: `units`, `upgrades`, `events`, `leaders`.

### Card Template

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

**Do not import `AbilityHelper`** — it is injected as the second parameter to `setupCardAbilities`. Importing it directly will cause issues.

### Leaders

Leaders override `setupLeaderSideAbilities(registrar, AbilityHelper)` for the horizontal leader side and `setupLeaderUnitSideAbilities(registrar, AbilityHelper)` for the deployed unit side. **Shared ability props between both sides must be defined in a method, not a class field** — class field objects get mutated during setup and will cause bugs.

### Ability Helpers

- `AbilityHelper.immediateEffects.*` — `GameSystem` implementations (damage, defeat, draw, exhaust, etc.)
- `AbilityHelper.ongoingEffects.*` — persistent effects (power/HP modifiers, keyword grants, etc.)
- `AbilityHelper.costs.*` — cost implementations
- `AbilityHelper.stateWatchers.*` — phase-scoped event history

---

## Writing Tests

### Test Template

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

### Key Test APIs

**Setup:** `contextRef.setupTestAsync(options)` — always `await`ed in `beforeEach`.

**Card references:** Cards are auto-referenced on `context` in camelCase by internal name (e.g., `cartel-spacer` → `context.cartelSpacer`). Always available: `context.p1Base`, `context.p2Base`, `context.p1Leader`, `context.p2Leader`.

**Player actions:** `player.clickCard(card)`, `player.clickPrompt(text)`, `player.passAction()`, `player.setResourceCount(n)`.

**Assertions:**
- `expect(card).toBeInZone('discard')` — prefer over `card.zoneName`
- `expect(player).toBeAbleToSelectExactly([...])` — exact selectable card set
- `expect(card).toHaveExactUpgradeNames([...])` — upgrades on a card
- `expect(player).toHavePrompt(text)`, `toHaveEnabledPromptButton(text)`
- `expect(player).toHavePassAbilityButton`, `toHavePassAbilityPrompt`
- `expect(player).toBeActivePlayer()`

**Phase helpers:** `this.moveToNextActionPhase()` — fast-forward through regroup.

---

## Key Conventions

- **`context.source` over `this`:** In ability handlers, use `context.source` and `context.player` rather than `this` and `this.controller` to get the correct card/player at resolution time.
- **Upgrade abilities:** When a gained ability targets the attached card, `context.source` is the _attached unit_, not the upgrade.
- **State watchers:** Record the _acting player_ at event time (e.g., `playedBy`) rather than relying on `controller`, which may change due to control-switching effects.
- **`override` keyword:** All method overrides must use `public override` / `protected override` (enforced by `noImplicitOverride`).
- **`import type`:** All type-only imports must use `import type` (ESLint-enforced).
- **Custom ESLint rules:** `forceteki/no-raw-token-text` prevents hardcoding text-replacement tokens; `forceteki/state-ref-array-requires-istatearray` enforces correct snapshot state types on arrays holding state refs.
