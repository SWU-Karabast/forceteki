import { Locations } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class ShiroGisu extends StrongholdCard {
    static id = 'shiro-gisu';

    setupCardAbilities() {
        this.action({
            title: 'Draw a card',
            cost: AbilityDsl.costs.bowSelf(),
            condition: (context) => this.getCharactersWithoutFate(context) && context.player.conflictDeck.size() > 0,
            effect: 'look at the top {1} cards of their conflict deck',
            effectArgs: (context) => this.getCharactersWithoutFate(context),
            gameAction: AbilityDsl.actions.deckSearch({
                amount: (context) => this.getCharactersWithoutFate(context),
                activePromptTitle: 'Choose a card to put in your hand',
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                }),
                shuffle: false,
                reveal: false,
                placeOnBottomInRandomOrder: true
            })
        });
    }

    getCharactersWithoutFate(context) {
        return context.player.opponent.cardsInPlay.filter((card) => card.getFate() === 0).length;
    }
}
