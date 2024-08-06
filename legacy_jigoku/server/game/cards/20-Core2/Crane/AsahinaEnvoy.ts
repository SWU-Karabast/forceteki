import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Decks, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class AsahinaEnvoy extends DrawCard {
    static id = 'asahina-envoy';

    setupCardAbilities() {
        this.interrupt({
            title: 'Put a character into a province',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                controller: Players.Self,
                cardCondition: (card) => card.location !== Locations.StrongholdProvince,
                gameAction: AbilityDsl.actions.deckSearch({
                    cardCondition: (card) =>
                        card.type === CardTypes.Character && card.printedCost >= 4 && card.isFaction('crane'),
                    amount: 6,
                    deck: Decks.DynastyDeck,
                    shuffle: true,
                    selectedCardsHandler: (context, event, cards) => {
                        if (cards.length === 0) {
                            return this.game.addMessage('{0} selects no characters', event.player);
                        }

                        this.game.addMessage(
                            '{0} selects {1} and puts it into {2}',
                            event.player,
                            cards,
                            context.target.facedown ? context.target.location : context.target
                        );

                        for (const card of cards) {
                            event.player.moveCard(card, context.target.location);
                            card.facedown = false;
                        }
                    }
                })
            },
            effect: 'put a character from their deck into a province'
        });
    }
}