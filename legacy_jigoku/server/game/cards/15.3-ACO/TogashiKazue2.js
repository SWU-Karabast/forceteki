const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, AbilityTypes } = require('../../Constants.js');

class TogashiKazue2 extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card.controller === context.player && card.type === CardTypes.Character,
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Persistent, {
                createCopies: true,
                condition: context => context.source.isDire(),
                effect: AbilityDsl.effects.increaseLimitOnAbilities()
            })
        });
    }
}

TogashiKazue2.id = 'togashi-kazue-2';

module.exports = TogashiKazue2;
