import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import { Card } from '../../../core/card/Card';
import * as Helpers from '../../../core/utils/Helpers';

export default class BoldResistance extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8022262805',
            internalName: 'bold-resistance'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose up to 3 units that share the same Trait. Each of those units gets +2/+0 for this phase.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                multiSelectCardCondition: (card, selectedCards) => this.cardHasCommonTraitWithPreviouslySelected(card, selectedCards),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }

    private cardHasCommonTraitWithPreviouslySelected(card: Card, selectedCards: Card[]) {
        // Collect all the traits of the card in question first
        const intersectingTraits = new Helpers.IntersectingSet(card.traits);

        // Now intersect those traits with each previously selected card
        for (const selectedCard of selectedCards) {
            intersectingTraits.intersect(selectedCard.traits);
            // If no traits remain, there is no common trait
            if (intersectingTraits.size === 0) {
                return false;
            }
        }
        return true;
    }
}

BoldResistance.implemented = true;
