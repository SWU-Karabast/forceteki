import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class ShadowedIntentions extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9003830954',
            internalName: 'shadowed-intentions',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbilityTargetingAttached({
            title: 'This unit can\'t be captured, defeated, or returned to its owner\'s hand by enemy card abilities',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeCaptured,
                    restrictedActionCondition: (context) => context.ability.card.controller !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeDefeated,
                    restrictedActionCondition: (context) => context.ability.card.controller !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.ReturnToHand,
                    restrictedActionCondition: (context) => context.ability.card.controller !== this.controller,
                }),
            ]
        });
    }
}
