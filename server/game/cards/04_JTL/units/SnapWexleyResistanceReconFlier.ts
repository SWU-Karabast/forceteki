import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, Trait, WildcardCardType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class SnapWexleyResistanceReconFlier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0524529055',
            internalName: 'snap-wexley#resistance-recon-flier',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'The next Resistance card you play this phase costs 1 resource less',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    match: (card) => card.hasSomeTrait(Trait.Resistance),
                    cardTypeFilter: WildcardCardType.Playable,
                    limit: AbilityHelper.limit.perGame(1),
                    amount: 1
                })
            })
        });

        this.addPilotingAbility({
            title: 'Search the top 5 cards of your deck for a Resistance card, reveal it, and draw it',
            type: AbilityType.Triggered,
            when: {
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Resistance),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}