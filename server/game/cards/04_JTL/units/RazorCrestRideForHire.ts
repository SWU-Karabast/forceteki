import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class RazorCrestRideForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1935873883',
            internalName: 'razor-crest#ride-for-hire',
        };
    }

    public override setupCardAbilities() {
        // TODO FIX TRIGGER
        this.addTriggeredAbility({
            title: 'Return a non-leader unit that costs 2 or less or an exhausted non-leader unit that costs 4 or less to its owner\'s hand',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.controller === context.player &&
                    event.card.isUpgrade() &&
                    event.card.hasSomeTrait(Trait.Pilot) &&
                    event.attachTarget === context.source
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
