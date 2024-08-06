import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class LiaisonToTheAncestors extends DrawCard {
    static id = 'liaison-to-the-ancestors';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Protect the honor of a character',
            when: {
                onCardDishonored: (event, context) =>
                    event.card.type === CardTypes.Character && event.card.controller === context.player
            },
            target: {
                activePromptTitle: 'Choose a character from your discard pile',
                location: [Locations.DynastyDiscardPile],
                controller: Players.Self,
                cardCondition: (card, context) => {
                    const matchingTraits = (context.event.card as DrawCard).getTraitSet();
                    return card.traits.some((trait) => matchingTraits.has(trait));
                },
                gameAction: AbilityDsl.actions.cancel({
                    replacementGameAction: AbilityDsl.actions.returnToDeck((context) => ({
                        target: context.target,
                        location: Locations.DynastyDiscardPile,
                        bottom: true
                    }))
                })
            },
            effect: "protect {1}'s honor, returning their ancestor {2} back to their deck",
            effectArgs: (context) => [context.event.card, context.target]
        });
    }
}