const DrawCard = require('../../drawcard.js');
const { AbilityTypes, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class YogoParamour extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Dishonor any character',
                cost: AbilityDsl.costs.bowSelf(),
                target: {
                    cardType: CardTypes.Character,
                    gameAction: AbilityDsl.actions.dishonor()
                }
            })
        });
    }
}

YogoParamour.id = 'yogo-paramour';

module.exports = YogoParamour;
