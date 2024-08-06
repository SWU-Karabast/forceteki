const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class MasterOfTheCourt extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel an event',
            when: {
                onInitiateAbilityEffects: (event, context) => event.card.type === CardTypes.Event && context.source.isHonored
            },
            cost: AbilityDsl.costs.discardStatusTokenFromSelf(),
            gameAction: AbilityDsl.actions.cancel()
        });
    }
}

MasterOfTheCourt.id = 'master-of-the-court';

module.exports = MasterOfTheCourt;
