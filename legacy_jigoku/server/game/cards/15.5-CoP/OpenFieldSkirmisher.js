const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class OpenFieldSkirmisher extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Reduce Province Strength',
            condition: context => context.source.isAttacking(),
            effect: 'reduce the strength of an attacked province by 3',
            cost: AbilityDsl.costs.removeFateFromSelf(),
            gameAction: AbilityDsl.actions.selectCard(context => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => card.isConflictProvince(),
                message: '{0} reduces the strength of {1} by 3',
                messageArgs: cards => [context.player, cards],
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    targetLocation: Locations.Provinces,
                    effect: AbilityDsl.effects.modifyProvinceStrength(-3)
                }))
            }))
        });
    }
}

OpenFieldSkirmisher.id = 'open-field-skirmisher';

module.exports = OpenFieldSkirmisher;
