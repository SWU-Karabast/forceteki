import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class RazorCrestRideForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1935873883',
            internalName: 'razor-crest#ride-for-hire',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return a non-leader unit that costs 2 or less or an exhausted non-leader unit that costs 4 or less to its owner\'s hand',
            when: {
                onUpgradeAttached: (event, context) => event.parentCard === context.source && event.upgradeCard.hasSomeTrait(Trait.Pilot)
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isNonLeaderUnit() && (card.cost <= 2 || (card.exhausted && card.cost <= 4)),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
