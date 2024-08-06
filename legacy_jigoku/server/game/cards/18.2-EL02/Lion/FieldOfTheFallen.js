const DrawCard = require('../../../drawcard.js');
const { Locations, Players } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class FieldOfTheFallen extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard then draw a card',
            condition: context => context.game.isDuringConflict('military'),
            cost: AbilityDsl.costs.discardCard({ location: Locations.Hand }),
            gameAction: AbilityDsl.actions.sequentialContext(context => {
                let moreHonorable = context.player.isMoreHonorable();
                let gameActions = [];
                gameActions.push(AbilityDsl.actions.draw(context => ({
                    target: context.player,
                    amount: 1
                }))
                );
                if(moreHonorable) {
                    gameActions.push(AbilityDsl.actions.selectCard(context => ({
                        location: [Locations.DynastyDiscardPile, Locations.ConflictDiscardPile],
                        player: Players.Any,
                        activePromptTitle: 'Select a card to place on the bottom of a deck',
                        message: '{0} places {1} on the bottom of {2}\'s {3} deck',
                        messageArgs: card => [context.player, card, card.owner, card.isDynasty ? 'dynasty' : 'conflict'],
                        gameAction: AbilityDsl.actions.returnToDeck({
                            location: Locations.Any,
                            bottom: true
                        })
                    })));
                }

                return ({
                    gameActions: gameActions
                });
            })
        });
    }
}

FieldOfTheFallen.id = 'field-of-the-fallen';

module.exports = FieldOfTheFallen;
