const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { TargetModes } = require('../../../Constants');

class DiplomaticHall extends DrawCard {
    setupCardAbilities() {
        this.action({
            condition: context => context.game.isDuringConflict('political'),
            title: 'Select a player to draw a card',
            target: {
                mode: TargetModes.Select,
                targets: true,
                choices:  {
                    [this.owner.name]: AbilityDsl.actions.draw({ target: this.owner }),
                    [this.owner.opponent && this.owner.opponent.name || 'NA']: AbilityDsl.actions.draw({ target: this.owner.opponent })
                }
            },
            effect: 'have {1} draw a card',
            effectArgs: context => context.select === this.owner.name ? this.owner : this.owner.opponent
        });
    }
}

DiplomaticHall.id = 'diplomatic-hall';

module.exports = DiplomaticHall;
