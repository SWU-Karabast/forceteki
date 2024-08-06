const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class RideThemDown extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Reduce province strength',
            cost: AbilityDsl.costs.discardImperialFavor(),
            condition: () => this.game.isDuringConflict(),
            effect: 'reduce the strength of an attacked province to 1',
            gameAction: AbilityDsl.actions.selectCard(context => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => card.isConflictProvince(),
                message: '{0} reduces the strength of {1} to 1',
                messageArgs: cards => [context.player, cards],
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    targetLocation: Locations.Provinces,
                    effect: AbilityDsl.effects.setBaseProvinceStrength(1)
                }))
            }))
        });
    }
}

RideThemDown.id = 'ride-them-down';

module.exports = RideThemDown;
