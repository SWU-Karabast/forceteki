const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Decks } = require('../../Constants');

class GuardiansOfRokugan extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Put a character into play',
            when: {
                afterConflict: (event, context) => context.player.isDefendingPlayer() && event.conflict.winner === context.player
            },
            gameAction: AbilityDsl.actions.deckSearch(() => ({
                activePromptTitle: 'Select a character to put into play',
                amount: context => context.game.currentConflict.skillDifference,
                deck: Decks.DynastyDeck,
                cardCondition: (card, context) => card.type === CardTypes.Character && AbilityDsl.actions.putIntoPlay().canAffect(card, context) && card.costLessThan(context.game.currentConflict.skillDifference + 1),
                gameAction: AbilityDsl.actions.putIntoPlay(),
                shuffle: context => context.game.currentConflict.skillDifference >= context.player.dynastyDeck.size()
            })),
            effect: 'look at the top {1} cards of their deck for a character costing {1} or less to put into play',
            effectArgs: context => [context.game.currentConflict.skillDifference]
        });
    }
}

GuardiansOfRokugan.id = 'guardians-of-rokugan';

module.exports = GuardiansOfRokugan;
