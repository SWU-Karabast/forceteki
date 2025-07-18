import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer } from '../../../core/Constants';

export default class CartelSpacer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3802299538',
            internalName: 'cartel-spacer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you control another Cunning unit, exhaust an enemy unit that costs 4 or less',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isAspectInPlay(Aspect.Cunning, context.source),
                    onTrue: AbilityHelper.immediateEffects.exhaust(),
                })
            }
        });
    }
}
