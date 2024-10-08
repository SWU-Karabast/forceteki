import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardLocation } from '../../../core/Constants';

export default class CargoJuggernaut extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9459170449',
            internalName: 'cargo-juggernaut'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'If you control another Vigilance unit, heal 4 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.getOtherUnitsInPlayWithAspect(context.source, Aspect.Vigilance).length > 0,
                onTrue: AbilityHelper.immediateEffects.heal((context) => ({ amount: 4, target: context.source.controller.base })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

CargoJuggernaut.implemented = true;
