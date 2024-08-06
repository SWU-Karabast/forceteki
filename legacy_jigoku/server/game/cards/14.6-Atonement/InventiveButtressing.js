const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes } = require('../../Constants');

class InventiveButtressing extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.persistentEffect({
            condition: () => this.game.isDuringConflict('military'),
            targetLocation: Locations.Provinces,
            match: (card, context) => card === context.source.parent,
            effect: AbilityDsl.effects.modifyProvinceStrength(3)
        });
    }

    canPlayOn(source) {
        return source && source.getType() === 'province' && source.controller === this.controller && !source.isBroken && this.getType() === CardTypes.Attachment;
    }

    canAttach(parent) {
        if(parent.type === CardTypes.Province && parent.isBroken) {
            return false;
        }

        if(parent.controller !== this.controller) {
            return false;
        }

        return parent && parent.getType() === CardTypes.Province && this.getType() === CardTypes.Attachment;
    }
}

InventiveButtressing.id = 'inventive-buttressing';

module.exports = InventiveButtressing;
