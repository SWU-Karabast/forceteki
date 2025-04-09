import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, PlayType, Trait } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

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
                onCardPlayed: (event, context) => event.card === context.source && event.playType !== PlayType.Piloting,
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    match: (card) => card.hasSomeTrait(Trait.Resistance),
                    limit: AbilityLimit.perGame(1),
                    amount: 1
                })
            })
        });

        this.addPilotingAbility({
            title: 'Search the top 5 cards of your deck for a Resistance card, reveal it, and draw it',
            type: AbilityType.Triggered,
            when: {
                onCardPlayed: (event, context) =>
                    event.card === context.source &&
                    event.playType === PlayType.Piloting
            },
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Resistance),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}