const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ThirdTower extends DrawCard {
    setupCardAbilities() {
        this.grantedAbilityLimits = {};
        this.reaction({
            title: 'Take an honor from your opponent',
            when: {
                onConflictDeclared: (event, context) => {
                    if(event.conflict.attackingPlayer === context.player) {
                        return false;
                    }
                    let cards = context.player.getDynastyCardsInProvince(event.conflict.declaredProvince.location);
                    return !cards.some(card => card.isFaceup() && card.type === CardTypes.Holding && card.hasTrait('kaiu-wall'));
                }
            },
            gameAction: AbilityDsl.actions.takeHonor(),
            limit: AbilityDsl.limit.unlimitedPerConflict()
        });
    }
}

ThirdTower.id = 'third-tower';

module.exports = ThirdTower;
