const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, Locations, Decks } = require('../../Constants');

class SoshisMemory extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Put a card into a player\'s hand',
            condition: context => context.source.controller.isTraitInPlay('shugenja'),
            effect: 'let {1} look at the top {2} cards of their conflict deck',
            effectArgs: context => [context.select, context.player.cardsInPlay.reduce((total, card) => total + (card.hasTrait('shugenja') ? 1 : 0), 0)],
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Choose a player',
                choices: {
                    [this.owner.name]: this.drawAbility(this.owner),
                    [this.owner.opponent && this.owner.opponent.name || 'NA']: this.drawAbility(this.owner.opponent)
                }
            }
        });
    }

    drawAbility(player) {
        return AbilityDsl.actions.deckSearch(() => ({
            player: player,
            activePromptTitle: 'Choose a card to put into your hand',
            reveal: false,
            amount: context => context.player.cardsInPlay.reduce((total, card) => total + (card.hasTrait('shugenja') ? 1 : 0), 0),
            deck: Decks.ConflictDeck,
            gameAction: AbilityDsl.actions.moveCard({
                destination: Locations.Hand
            })
        }));
    }
}

SoshisMemory.id = 'soshi-s-memory';

module.exports = SoshisMemory;
