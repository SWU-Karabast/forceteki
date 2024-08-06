const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, AbilityTypes } = require('../../Constants.js');

class CommandTheTributary extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Move 1 fate to a character',
                target: {
                    cardType: CardTypes.Character,
                    gameAction: AbilityDsl.actions.placeFate((context) => ({
                        origin: context.source,
                        amount: 1
                    }))
                }
            })
        });
    }
}

CommandTheTributary.id = 'command-the-tributary';

module.exports = CommandTheTributary;
