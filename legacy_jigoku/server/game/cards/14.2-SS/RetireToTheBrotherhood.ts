import { Locations, CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class RetireToTheBrotherhood extends ProvinceCard {
    static id = 'retire-to-the-brotherhood';

    setupCardAbilities() {
        this.reaction({
            title: 'Retire characters with no fate',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.discardFromPlay((context) => ({
                    target: context.player.cardsInPlay
                        .filter((a) => a.getFate() === 0)
                        .concat(
                            context.player.opponent
                                ? context.player.opponent.cardsInPlay.filter((a) => a.getFate() === 0)
                                : []
                        )
                })),
                AbilityDsl.actions.multiple([
                    AbilityDsl.actions.lookAt((context) => ({
                        target: this.getRevealedCards(context, context.player),
                        message: '{0} reveals {1}',
                        messageArgs: (cards) => [context.player, cards]
                    })),
                    AbilityDsl.actions.lookAt((context) => ({
                        target: this.getRevealedCards(context, context.player.opponent),
                        message: '{0} reveals {1}',
                        messageArgs: (cards) => [context.player.opponent, cards]
                    }))
                ]),
                AbilityDsl.actions.multiple([
                    AbilityDsl.actions.putIntoPlay((context) => ({
                        target: this.getCharacters(context, context.player)
                    })),
                    AbilityDsl.actions.opponentPutIntoPlay((context) => ({
                        target: this.getCharacters(context, context.player.opponent)
                    }))
                ]),
                AbilityDsl.actions.handler({
                    //just for the display message
                    handler: (context) => {
                        //Identify who actually entered play
                        let enteredPlay = context.events
                            .filter((a) => a.name === 'onCharacterEntersPlay' && !a.cancelled)
                            .map((a) => a.card);
                        let myEnter = enteredPlay.filter((a) => a.controller === context.player);
                        let oppEnter = enteredPlay.filter((a) => a.controller === context.player.opponent);
                        if (myEnter.length > 0) {
                            this.game.addMessage('{0} puts {1} into play', context.player, myEnter);
                        }
                        if (oppEnter.length > 0) {
                            this.game.addMessage('{0} puts {1} into play', context.player.opponent, oppEnter);
                        }
                    }
                }),
                AbilityDsl.actions.multiple([
                    AbilityDsl.actions.shuffleDeck((context) => ({
                        deck: Locations.DynastyDeck,
                        target: context.player
                    })),
                    AbilityDsl.actions.shuffleDeck((context) => ({
                        deck: Locations.DynastyDeck,
                        target: context.player.opponent ? context.player.opponent : []
                    }))
                ])
            ])
        });
    }

    getBrotherhoodCards(context, player) {
        if (!player) {
            let def = [];
            def.push([]);
            def.push([]);
            return def;
        }
        let events = context.events.filter((a) => a.name === 'onCardLeavesPlay' && !a.cancelled);
        let allCards = events.map((a) => a.cardStateWhenLeftPlay);
        let cards = allCards.filter((a) => a.controller === player);

        //Figure out how many cards to reveal and which characters to put into play
        let deck = player.dynastyDeck.value();
        let revealedCards = [];
        let characters = [];
        for (let i = 0; i < deck.length && characters.length < cards.length; i++) {
            revealedCards.push(deck[i]);
            if (deck[i].type === CardTypes.Character) {
                characters.push(deck[i]);
            }
        }

        let results = [];
        results.push(revealedCards);
        results.push(characters);
        return results;
    }

    getRevealedCards(context, player) {
        return this.getBrotherhoodCards(context, player)[0];
    }

    getCharacters(context, player) {
        return this.getBrotherhoodCards(context, player)[1];
    }
}
