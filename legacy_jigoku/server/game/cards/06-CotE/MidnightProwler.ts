import DrawCard = require('../../drawcard');

export default class MidnightProwler extends DrawCard {
    static id = 'midnight-prowler';

    public setupCardAbilities() {
        this.reaction({
            title: 'Look at the top two card of your opponents conflict deck.',
            when: {
                afterConflict: (event, context) =>
                    this.game.isDuringConflict('military') &&
                    context.source.isParticipating() &&
                    event.conflict.winner === context.source.controller &&
                    context.player.opponent !== undefined
            },
            handler: (context) =>
                this.game.promptWithHandlerMenu(context.player, {
                    activePromptTitle: 'Which card do you want to discard?',
                    context: context,
                    cards: context.player.opponent.conflictDeck.first(2),
                    choices: ['Do not discard either card.'],
                    handlers: [() => true],
                    cardHandler: (card: DrawCard) => {
                        context.player.opponent.moveCard(card, 'conflict discard pile');
                        context.game.addMessage('{0} chooses to discard {1}', context.player, card);
                    }
                })
        });
    }
}
