import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { AbilityRestriction } from '../../../core/Constants';
import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';

export default class LurkingTIEPhantom extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1810342362',
            internalName: 'lurking-tie-phantom',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit can\'t be captured, damaged, or defeated by enemy card abilities',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.ReceiveDamage,
                    restrictedActionCondition: (context) => !(context.ability instanceof InitiateAttackAction) && context.ability.controller !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeCaptured,
                    restrictedActionCondition: (context) => context.ability.controller !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeDefeated,
                    restrictedActionCondition: (context) => context.ability.controller !== this.controller,
                })
            ]
        });
    }
}
