const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class WhiteHordeVanguard extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.game.isDuringConflict() && context.game.conflictRecord.filter(record => record.completed).length === 0,
            effect: [
                AbilityDsl.effects.cardCannot({
                    cannot: 'sendHome',
                    restricts: 'opponentsCardEffects'
                }),
                AbilityDsl.effects.cardCannot({
                    cannot: 'moveToConflict',
                    restricts: 'opponentsCardEffects'
                }),
                AbilityDsl.effects.cardCannot({
                    cannot: 'bow',
                    restricts: 'opponentsCardEffects'
                })
            ]
        });
    }
}

WhiteHordeVanguard.id = 'white-horde-vanguard';

module.exports = WhiteHordeVanguard;
