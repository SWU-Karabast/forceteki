import { TriggeredAbilityBase } from '../../../core/ability/TriggeredAbility';
import type { Attack } from '../../../core/attack/Attack';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import { EventName } from '../../../core/Constants';
import type { GameEvent } from '../../../core/event/GameEvent';
import type { Game } from '../../../core/Game';
import { registerState, stateRef } from '../../../core/GameObjectUtils';
import { Contract } from '../../../core/utils/Contract';
import type { ITriggeredAbilityProps } from '../../../Interfaces';

export default class Advantage extends TokenUpgradeCard {
    @stateRef()
    private accessor _whenAttackOrDefenseEndsAbility: TriggeredAbilityBase | null = null;

    protected override getImplementationId() {
        return {
            id: '5844562972',
            internalName: 'advantage',
        };
    }

    public override isAdvantage(): this is Advantage {
        return true;
    }

    public override getTriggeredAbilities(): TriggeredAbilityBase[] {
        const abilities = super.getTriggeredAbilities();

        return this._whenAttackOrDefenseEndsAbility != null
            ? [...abilities, this._whenAttackOrDefenseEndsAbility]
            : abilities;
    }

    public checkRegisterWhenAttackOrDefenseEndsAbility(event: GameEvent) {
        Contract.assertIsNullLike(
            this._whenAttackOrDefenseEndsAbility,
            `Failed to unregister "When Attack/Defense Ends" abilities from previous play: ${this._whenAttackOrDefenseEndsAbility?.getTitle()}`
        );

        const ability = new AdvantageAbility(this.game, this);
        this._whenAttackOrDefenseEndsAbility = ability;
        ability.registerEvents();

        event.addCleanupHandler(() => this.unregisterWhenAttackOrDefenseEndsAbility());
    }

    public unregisterWhenAttackOrDefenseEndsAbility() {
        Contract.assertNotNullLike(this._whenAttackOrDefenseEndsAbility, 'When Attack/Defense Ends ability registration was skipped');

        this._whenAttackOrDefenseEndsAbility.unregisterEvents();
        this._whenAttackOrDefenseEndsAbility = null;
    }

    /**
     * Registers the game-level rules listeners for token upgrades. Called once at game start from
     * {@link Game.registerGlobalRulesListeners}, mirroring {@link UnitPropertiesCard.registerRulesListeners}.
     */
    public static registerRulesListeners(game: Game) {
        game.on(EventName.OnAttackEnd + ':preResolve', (event) => {
            const attack = event.attack as Attack;

            if (attack == null) {
                return;
            }

            const involvedAdvantageTokens = [attack.attacker, ...attack.getAllTargets()]
                .filter((card) => card.isUnit())
                .flatMap((unit) => (unit.isInPlay() ? unit.upgrades : []))
                .filter((upgrade) => upgrade.isAdvantage());

            for (const token of involvedAdvantageTokens) {
                if (!token.isBlank()) {
                    token.checkRegisterWhenAttackOrDefenseEndsAbility(event);
                }
            }
        });
    }
}

@registerState()
export class AdvantageAbility extends TriggeredAbilityBase {
    public constructor(game: Game, card: Advantage) {
        Contract.assertTrue(card.isUpgrade());
        Contract.assertTrue(card.isAdvantage());

        super(game, card, AdvantageAbility.buildAdvantageAbilityProperties(game));
    }

    private static buildAdvantageAbilityProperties(game: Game): ITriggeredAbilityProps<Advantage> {
        return {
            title: 'Defeat Advantage token',
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attacker === context.source.parentCard ||
                    event.attack.getAllTargets().includes(context.source.parentCard)
            },
            immediateEffect: game.abilityHelper.immediateEffects.defeat()
        };
    }
}
