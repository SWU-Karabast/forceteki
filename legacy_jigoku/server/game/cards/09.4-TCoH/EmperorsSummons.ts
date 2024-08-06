import { CardTypes, Locations, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class EmperorsSummons extends ProvinceCard {
    static id = 'emperor-s-summons';

    setupCardAbilities() {
        this.reaction({
            title: 'Search for a character card',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.cardMenu((context) => ({
                cards: context.player.dynastyDeck.filter((card) => card.type === CardTypes.Character),
                choices: ['Select nothing'],
                handlers: [() => this.game.addMessage('{0} selects nothing from their deck', context.player)],
                gameAction: AbilityDsl.actions.selectCard({
                    cardType: CardTypes.Province,
                    location: Locations.Provinces,
                    controller: Players.Self,
                    cardCondition: (card) => card.location !== Locations.StrongholdProvince,
                    subActionProperties: (card) => ({ destination: card.location }),
                    gameAction: AbilityDsl.actions.moveCard({ discardDestinationCards: true, faceup: true }),
                    message: '{1} chooses to place {2} in {0} discarding {3}',
                    messageArgs: (card, player, properties) => [
                        card.location,
                        player,
                        properties.target,
                        player.getDynastyCardsInProvince(card.location)
                    ]
                })
            })),
            effect: 'choose a character to place in a province'
        });
    }
}
