import { TriggeredAbilityBase } from '../../../core/ability/TriggeredAbility';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import type { Game } from '../../../core/Game';
import { registerState } from '../../../core/GameObjectUtils';
import { Contract } from '../../../core/utils/Contract';
import type { ITriggeredAbilityProps } from '../../../Interfaces';

export default class Advantage extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5844562972',
            internalName: 'advantage',
        };
    }

    public override isAdvantage(): this is Advantage {
        return true;
    }

    protected override buildWhenAttackOrDefenseEndsAbilities(): TriggeredAbilityBase[] {
        return [new AdvantageAbility(this.game, this)];
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
