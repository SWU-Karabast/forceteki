const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes, Players } = require('../../Constants');

class Unhallow extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.persistentEffect({
            targetLocation: Locations.Provinces,
            match: (card, context) => card === context.source.parent,
            effect: AbilityDsl.effects.modifyProvinceStrength(3)
        });

        this.persistentEffect({
            condition: (context) => context.source.parent && context.source.parent.isConflictProvince(),
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            effect: AbilityDsl.effects.costToDeclareAnyParticipants({
                type: 'defenders',
                message: 'loses 1 honor',
                cost: (player) => AbilityDsl.actions.loseHonor({
                    target: player,
                    amount: 1
                })
            })
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

    isTemptationsMaho() {
        return true;
    }
}

Unhallow.id = 'unhallow';

module.exports = Unhallow;
