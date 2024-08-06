const DrawCard = require('../../drawcard.js');
const { Locations } = require('../../Constants');

class WrathOfTheKami extends DrawCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Add Province Strength',
            condition: context => this.game.isDuringConflict() && context.source.isInConflictProvince(),
            cost: ability.costs.payHonor(1),
            limit: ability.limit.unlimitedPerConflict(),
            effect: 'add 1 to the province strength of {1}',
            effectArgs: context => [context.source.controller.getProvinceCardInProvince(context.source.location)],
            gameAction: ability.actions.cardLastingEffect(context => ({
                target: context.source.controller.getProvinceCardInProvince(context.source.location),
                targetLocation: Locations.Provinces,
                effect: ability.effects.modifyProvinceStrength(1)
            }))
        });
    }
}

WrathOfTheKami.id = 'the-wrath-of-the-kami';

module.exports = WrathOfTheKami;
