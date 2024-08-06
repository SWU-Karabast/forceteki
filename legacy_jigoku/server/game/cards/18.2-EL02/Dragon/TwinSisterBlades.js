const DrawCard = require('../../../drawcard.js');
const { Players, AbilityTypes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl.js');

class TwinSisterBlades extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Draw cards',
                condition: context => context.source.isParticipating() && context.source.hasTrait('bushi'),
                effect: 'draw {1} card{2}',
                effectArgs: context => this.getNumberOfCards(context) === 2 ? ['2', 's'] : ['a', ''],
                gameAction: AbilityDsl.actions.draw(context => ({
                    target: context.player,
                    amount: this.getNumberOfCards(context)
                }))
            })
        });
    }

    getNumberOfCards(context) {
        if (context.source.hasTrait('duelist') && context.game.currentConflict.hasMoreParticipants(context.player.opponent)) {
            return 2;
        }
        return 1;
    }
}

TwinSisterBlades.id = 'twin-sister-blades';

module.exports = TwinSisterBlades ;
