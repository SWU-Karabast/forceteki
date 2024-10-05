import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, WildcardLocation } from '../../../core/Constants';

export default class CartelSpacer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3802299538',
            internalName: 'cartel-spacer'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'If you control another Cunning unit, exhaust an enemy unit that costs 4 or less',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.getOtherUnitsInPlayWithAspect(context.source,Aspect.Cunning).length > 0,
                    onTrue: AbilityHelper.immediateEffects.exhaust(),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

CartelSpacer.implemented = true;
