const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class JewelOfTheKhamasin extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Reduce province strength',
            condition: context => context.source.parent && context.source.parent.isAttacking(),
            cost: AbilityDsl.costs.payHonor(1),
            limit: AbilityDsl.limit.unlimitedPerConflict(),
            gameAction: AbilityDsl.actions.selectCard(context => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => card.isConflictProvince() && card.getStrength() > 0,
                message: '{0} reduces the strength of {1} by 1',
                messageArgs: cards => [context.player, cards],
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    targetLocation: Locations.Provinces,
                    effect: AbilityDsl.effects.modifyProvinceStrength(-1)
                }))
            })),
            effect: 'reduce an attacked province strength by 1'
        });
    }
}

JewelOfTheKhamasin.id = 'jewel-of-the-khamasin';

module.exports = JewelOfTheKhamasin;
