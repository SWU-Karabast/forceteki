const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Durations } = require('../../Constants');

class NeverYield extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'characters can\'t bow or be sent home',
            when: {
                onConflictDeclared: (event, context) => event.conflict.attackingPlayer === context.player
            },
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                duration: Durations.UntilEndOfConflict,
                target: context.player.cardsInPlay.filter(card => card.type === CardTypes.Character),
                effect: [
                    AbilityDsl.effects.cardCannot({
                        cannot: 'sendHome',
                        restricts: 'opponentsCardEffects',
                        applyingPlayer: context.player
                    }),
                    AbilityDsl.effects.cardCannot({
                        cannot: 'bow',
                        restricts: 'opponentsCardEffects',
                        applyingPlayer: context.player
                    })
                ]
            })),
            effect: 'make it so {1}\'s card effects can\'t bow or send home {2}\'s characters currently in play until the end of the conflict.',
            effectArgs: context => [context.player.opponent, context.player]
        });
    }
}

NeverYield.id = 'never-yield';

module.exports = NeverYield;
