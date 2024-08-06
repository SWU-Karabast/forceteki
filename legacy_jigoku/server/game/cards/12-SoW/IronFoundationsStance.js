const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players } = require('../../Constants.js');

class IronFoundationsStance extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Prevent opponent\'s bow and send home effects',
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating() && card.hasTrait('monk'),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'sendHome',
                            restricts: 'opponentsCardEffects',
                            applyingPlayer: context.player
                        })
                    })),
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'bow',
                            restricts: 'opponentsCardEffects',
                            applyingPlayer: context.player
                        })
                    })),
                    AbilityDsl.actions.conditional({
                        condition: (context) => context.player.isKihoPlayedThisConflict(context, this),
                        trueGameAction: AbilityDsl.actions.draw((context) => ({ target: context.player })),
                        falseGameAction: AbilityDsl.actions.draw({ amount: 0 })
                    })
                ])
            },
            effect: 'prevent opponents\' actions from bowing or moving home {0}{1}',
            effectArgs: (context) => (context.player.isKihoPlayedThisConflict(context, this) ? ' and draw 1 card' : '')
        });
    }
}

IronFoundationsStance.id = 'iron-foundations-stance';

module.exports = IronFoundationsStance;
