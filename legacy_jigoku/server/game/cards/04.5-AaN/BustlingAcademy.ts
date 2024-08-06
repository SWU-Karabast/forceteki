import { CardTypes, Locations } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class BustlingAcademy extends DrawCard {
    static id = 'bustling-academy';

    public setupCardAbilities() {
        this.action({
            title: 'Discard a card in a province and refill it faceup',
            condition: (context) =>
                context.player.cardsInPlay.any((card) => card.hasTrait('scholar')) &&
                context.player.opponent !== undefined,
            target: {
                location: Locations.Provinces,
                cardType: [CardTypes.Character, CardTypes.Holding, CardTypes.Event],
                gameAction: AbilityDsl.actions.moveCard({ destination: Locations.DynastyDiscardPile })
            },
            effect: 'discard {0} and refill it faceup',
            then: (context) => ({
                gameAction: AbilityDsl.actions.refillFaceup(() => ({
                    target: context.events[0].cardStateWhenMoved.controller,
                    location: context.events[0].cardStateWhenMoved.location
                }))
            })
        });
    }
}
