const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ShadowSteed extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.addTrait('cavalry')
        });

        this.action({
            title: 'Ready attached character',
            condition: context => context.source.parent && context.source.parent.getFate() === 0,
            cost: AbilityDsl.costs.payHonor(1),
            gameAction: AbilityDsl.actions.ready(context => ({target: context.source.parent}))
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

ShadowSteed.id = 'shadow-steed';

module.exports = ShadowSteed;

