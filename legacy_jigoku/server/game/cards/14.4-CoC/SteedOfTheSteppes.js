const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

const steedOfTheSteppesCaptureParentCost = function() {
    return {
        action: { name: 'steedOfTheSteppesCaptureParentCost', getCostMessage: () => '' },
        canPay: function() {
            return true;
        },
        resolve: function(context) {
            context.costs.steedOfTheSteppesCaptureParentCost = context.source.parent;
        },
        pay: function() {
        }
    };
};

class SteedOfTheSteppes extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.addTrait('cavalry')
        });

        this.action({
            title: 'Ready attached character',
            condition: context => context.player.opponent && context.player.getNumberOfOpponentsFaceupProvinces() >= 3,
            cost: [
                steedOfTheSteppesCaptureParentCost(),
                AbilityDsl.costs.sacrificeSelf()
            ],
            //need to put both as a target, context.source.parent is for the pre-cost checks, context.costs.steedOfTheSteppesCaptureParentCost is for the actual stand
            //I don't like it, but it isnn't work otherwise
            gameAction: AbilityDsl.actions.ready(context => ({ target: [context.source.parent, context.costs.steedOfTheSteppesCaptureParentCost] }))
        });
    }
}

SteedOfTheSteppes.id = 'steed-of-the-steppes';

module.exports = SteedOfTheSteppes;
