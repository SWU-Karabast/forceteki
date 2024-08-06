const DrawCard = require('../../drawcard.js');
const { CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class WayOfTheWarrior extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Let a bushi embrace the way of the warrior',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: card => card.isParticipating() && card.hasTrait('bushi'),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect(context => ({
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
                            }),
                            AbilityDsl.effects.cardCannot({
                                cannot: 'dishonor',
                                restricts: 'opponentsCardEffects',
                                applyingPlayer: context.player
                            })
                        ]
                    })),
                    AbilityDsl.actions.ready()
                ])
            },
            effect: 'ready and prevent opponent\'s card effects from bowing, sending home, or dishonoring {0}'
        });
    }
}

WayOfTheWarrior.id = 'way-of-the-warrior';

module.exports = WayOfTheWarrior;
