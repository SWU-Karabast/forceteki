const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');

class MountaintopStatuary extends DrawCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Move this to stronghold province',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            effect: 'move it to their stronghold province',
            gameAction: ability.actions.moveCard({ destination: Locations.StrongholdProvince })
        });
        this.action({
            title: 'Send a 2 or lower cost character home',
            cost: ability.costs.sacrificeSelf(),
            condition: context => this.game.isDuringConflict() && context.source.isInConflictProvince(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isAttacking() && card.costLessThan(3),
                gameAction: ability.actions.sendHome()
            }
        });
    }
}

MountaintopStatuary.id = 'mountaintop-statuary';

module.exports = MountaintopStatuary;
