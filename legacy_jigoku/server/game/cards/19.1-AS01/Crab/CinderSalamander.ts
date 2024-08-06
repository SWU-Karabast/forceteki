import { CardTypes, Decks, Elements, Locations, Players, TargetModes } from '../../../Constants';
import AbilityDsl = require('../../../abilitydsl');
import BaseCard = require('../../../basecard');
import DrawCard = require('../../../drawcard');

const ELEMENT_KEY = 'cinder-salamander-fire';

export default class CinderSalamander extends DrawCard {
    static id = 'cinder-salamander';

    public setupCardAbilities() {
        this.reaction({
            title: 'Shuffle this character back into the deck',
            location: Locations.DynastyDiscardPile,
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.moveCard({
                destination: Locations.DynastyDeck,
                shuffle: true
            })
        });

        this.action({
            title: 'Search other copies of this character and put them into play',
            condition: (context) =>
                this.game.rings[this.getCurrentElementSymbol(ELEMENT_KEY)].isConsideredClaimed(context.player),

            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.deckSearch({
                    activePromptTitle: 'Select characters to put into play from your deck',
                    deck: Decks.DynastyDeck,
                    targetMode: TargetModes.UpTo,
                    numCards: 3,
                    cardCondition: (card) => this.isSalamanderCard(card),
                    shuffle: true,
                    gameAction: AbilityDsl.actions.putIntoPlay(),
                    message: '{0} finds {1} in their deck',
                    messageArgs: (context, cards) => [context.player, this.salamanderCountToText(cards.length)]
                }),
                AbilityDsl.actions.selectCard({
                    activePromptTitle: 'Select characters to put into play from your provinces',
                    controller: Players.Self,
                    cardType: CardTypes.Character,
                    location: Locations.Provinces,
                    mode: TargetModes.UpTo,
                    numCards: 3,
                    cardCondition: (card) => this.isSalamanderCard(card),
                    gameAction: AbilityDsl.actions.putIntoPlay(),
                    message: '{0} finds {1} in their provinces',
                    messageArgs: (cards, player) => [player, this.salamanderCountToText(cards.length)]
                })
            ]),
            effect: 'search their deck and provinces for other copies of {0} and put them into play',
            max: AbilityDsl.limit.perRound(1)
        });
    }

    public getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: ELEMENT_KEY,
            prettyName: 'Claimed Ring',
            element: Elements.Fire
        });
        return symbols;
    }

    private isSalamanderCard(card: BaseCard): boolean {
        return card.id === this.id;
    }

    private salamanderCountToText(salamanderCount: number): string {
        return salamanderCount > 1
            ? salamanderCount + ' salamanders'
            : salamanderCount === 1
            ? '1 salamander'
            : 'no salamanders';
    }
}
