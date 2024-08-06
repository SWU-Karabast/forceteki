import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ShibaBodyguard extends DrawCard {
    static id = 'shiba-bodyguard';

    public setupCardAbilities() {
        this.interrupt({
            title: 'Place a fate on a character',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => !card.hasTrait('bushi'),
                gameAction: AbilityDsl.actions.placeFate((context) => ({
                    origin: context.player
                }))
            },
            effect: "place a fate from {1}'s fate pool on {0}",
            effectArgs: (context) => [context.player]
        });
    }
}