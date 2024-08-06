const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class BondsOfBlood extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Send a character home',
            cost: AbilityDsl.costs.dishonor({ cardCondition: card => card.isParticipating() }),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isParticipating() && card.allowGameAction('sendHome', context)
            },
            cannotTargetFirst: true,
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.sendHome(context => ({target: context.target })),
                AbilityDsl.actions.sendHome(context => ({target: context.costs.dishonor }))
            ])
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

BondsOfBlood.id = 'bonds-of-blood';

module.exports = BondsOfBlood;
