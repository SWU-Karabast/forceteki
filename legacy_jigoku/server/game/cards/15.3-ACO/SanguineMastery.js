const DrawCard = require('../../drawcard.js');
const { CardTypes, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class SanguineMastery extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard attachments',
            cost: AbilityDsl.costs.dishonor({ cardCondition: card => card.glory > 0 }),
            target: {
                mode: TargetModes.UpToVariable,
                numCardsFunc: (context) => context.costs.dishonor ? context.costs.dishonor.glory : 1,
                cardType: CardTypes.Attachment,
                gameAction: AbilityDsl.actions.discardFromPlay()
            },
            cannotTargetFirst: true
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

SanguineMastery.id = 'sanguine-mastery';

module.exports = SanguineMastery;
