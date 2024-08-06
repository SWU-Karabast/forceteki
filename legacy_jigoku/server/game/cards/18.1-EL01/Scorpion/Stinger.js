const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { Locations, Players, CardTypes, Phases } = require('../../../Constants.js');

class Stinger extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            condition: context => context.game.currentPhase !== Phases.Fate,
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'ready',
                source: this
            })
        });

        this.action({
            title: 'Attach this to an attacking character',
            cost: AbilityDsl.costs.payHonor(1),
            condition: context => context.game.isDuringConflict('military'),
            location: Locations.Hand,
            target: {
                player: Players.Self,
                cardType: CardTypes.Character,
                cardCondition: card => card.isAttacking(),
                gameAction: AbilityDsl.actions.attach(context => ({
                    attachment: context.source,
                    target: context.target
                }))
            }
        });
    }
}

Stinger.id = 'stinger';
module.exports = Stinger;
