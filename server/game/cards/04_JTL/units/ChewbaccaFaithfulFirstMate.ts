import AbilityHelper from '../../../../../server/game/AbilityHelper';
import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import { AbilityRestriction, AbilityType } from '../../../../../server/game/core/Constants';

export default class ChewbaccaFaithfulFirstMate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7208848194',
            internalName: 'chewbacca#faithful-first-mate',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit can\'t be defeated or returned to hand by enemy card abilities',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.ReturnToHand,
                    restrictedActionCondition: (context) => context.player !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeDefeated,
                    restrictedActionCondition: (context) => context.player !== this.controller,
                })
            ]
        });

        this.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Constant,
            title: 'This unit can\'t be captured or damaged by enemy card abilities',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.ReturnToHand,
                    restrictedActionCondition: (context) => context.player !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeDefeated,
                    restrictedActionCondition: (context) => context.player !== this.controller,
                })
            ]
        });
    }
}
