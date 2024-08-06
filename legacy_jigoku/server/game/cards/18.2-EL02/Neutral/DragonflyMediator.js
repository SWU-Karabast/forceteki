const DrawCard = require('../../../drawcard.js');
const { Locations, Players, TargetModes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class DragonflyMediator extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Have each player reveal cards from their hand',
            targets: {
                myCard: {
                    activePromptTitle: 'Choose a card to reveal',
                    location: Locations.Hand,
                    controller: Players.Self,
                    gameAction: AbilityDsl.actions.lookAt(context => ({
                        message: '{0} sees {1} from {2}',
                        messageArgs: cards => [context.source, cards, context.player]
                    }))
                },
                oppCard: {
                    activePromptTitle: 'Choose three cards to reveal',
                    mode: TargetModes.ExactlyVariable,
                    numCardsFunc: context => Math.min(3, context.player.opponent.hand.size()),
                    player: Players.Opponent,
                    location: Locations.Hand,
                    controller: Players.Opponent,
                    gameAction: AbilityDsl.actions.lookAt(context => ({
                        message: '{0} sees {1} from {2}',
                        messageArgs: cards => [context.source, cards, context.player.opponent]
                    }))
                }
            },
            effect: 'have each player reveal cards from their hand'
        });
    }
}

DragonflyMediator.id = 'dragonfly-mediator';
module.exports = DragonflyMediator;
