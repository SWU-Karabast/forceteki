import { CardTypes, Locations } from '../../Constants';
import { BaseOni } from './_BaseOni';
import AbilityDsl = require('../../abilitydsl');

export default class ScavengingGoblin extends BaseOni {
    static id = 'scavenging-goblin';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Remove cards from the game',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller &&
                    context.source.isParticipating() &&
                    context.player.opponent &&
                    context.player.opponent.conflictDeck.size() > 0
            },
            effect: "remove the top 3 cards of {1}'s conflict deck from the game as well as any matching attachments",
            effectArgs: (context) => [context.player.opponent],
            gameAction: AbilityDsl.actions.multipleContext((context) => {
                const cardsToRemove = context.player.opponent.conflictDeck.first(3);
                let cardNames = cardsToRemove.map((card) => card.name);
                const attachmentsToRemove = this.game.allCards.filter((card) => {
                    if (card.location !== 'play area') {
                        return false;
                    }
                    if (card.type !== CardTypes.Attachment) {
                        return false;
                    }
                    if (card.controller === context.player) {
                        return false;
                    }
                    return cardNames.includes(card.name);
                });

                this.messageShown = false;
                return {
                    gameActions: [
                        AbilityDsl.actions.removeFromGame({
                            target: cardsToRemove,
                            location: Locations.ConflictDeck
                        }),
                        AbilityDsl.actions.removeFromGame({
                            target: attachmentsToRemove
                        }),
                        AbilityDsl.actions.handler({
                            handler: (context) => {
                                if (!this.messageShown) {
                                    // for some reason, it shows the message twice
                                    context.game.addMessage(
                                        "{0} {1} removed from the game from the top of {2}'s conflict deck",
                                        cardsToRemove,
                                        cardsToRemove.length > 1 ? 'are' : 'is',
                                        context.player.opponent
                                    );
                                    if (attachmentsToRemove.length > 0) {
                                        context.game.addMessage(
                                            '{0} {1} removed from the game due to sharing a name with a card that was removed from the deck',
                                            attachmentsToRemove,
                                            attachmentsToRemove.length > 1 ? 'are' : 'is'
                                        );
                                    }
                                }
                            }
                        })
                    ]
                };
            })
        });
    }
}
