const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class TheSkinOfFuLeng extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true,
            unique: true
        });

        this.persistentEffect({
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'triggerAbilities',
                restricts: ['charactersWithNoFate', 'nonForcedAbilities']
            })
        });

        this.persistentEffect({
            match: card => card.getFate() === 0,
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.canBeTriggeredByOpponent()
        });
    }
}

TheSkinOfFuLeng.id = 'the-skin-of-fu-leng';

module.exports = TheSkinOfFuLeng;
