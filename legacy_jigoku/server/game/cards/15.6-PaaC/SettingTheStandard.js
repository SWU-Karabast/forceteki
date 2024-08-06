const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes } = require('../../Constants.js');

class SettingTheStandard extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Draw 2 cards and discard one',
                when: {
                    afterConflict: (event, context) =>
                        event.conflict.winner === context.source.controller && context.source.isParticipating()
                },
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.draw((context) => ({ target: context.player, amount: 2 })),
                    AbilityDsl.actions.chosenDiscard((context) => ({ target: context.player }))
                ]),
                effect: 'draw 2 cards, then discard 1'
            })
        });
    }
}

SettingTheStandard.id = 'setting-the-standard';

module.exports = SettingTheStandard;
