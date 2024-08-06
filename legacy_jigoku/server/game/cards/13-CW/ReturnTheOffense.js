const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { DuelTypes } = require('../../Constants');

class ReturnTheOffense extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            initiateDuel: {
                type: DuelTypes.Political,
                message: '{0}{1}{2}{3}{4}',
                messageArgs: duel => [
                    duel.winner,
                    duel.winner ? ' does not bow as a result of conflict resolution' : '',
                    duel.loser ? ' and ' : '',
                    duel.loser,
                    duel.loser ? ' cannot be readied' : ''
                ],
                gameAction: duel => AbilityDsl.actions.multiple([
                    AbilityDsl.actions.cardLastingEffect(({
                        target: duel.winner,
                        effect: AbilityDsl.effects.doesNotBow()
                    })),
                    AbilityDsl.actions.cardLastingEffect({
                        target: duel.loser,
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'ready',
                            restricts: 'cardEffects'
                        })
                    })
                ])
            }
        });
    }
}

ReturnTheOffense.id = 'return-the-offense';

module.exports = ReturnTheOffense;
