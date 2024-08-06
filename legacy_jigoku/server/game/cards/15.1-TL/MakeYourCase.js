const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { DuelTypes } = require('../../Constants');

class MakeYourCase extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            initiateDuel: {
                type: DuelTypes.Political,
                opponentChoosesDuelTarget: true,
                message: '{0}{1}',
                messageArgs: duel => [
                    duel.winner,
                    duel.winner ? ' gains a fate' : ''
                ],
                gameAction: duel => AbilityDsl.actions.placeFate({
                    target: duel.winner,
                    amount: 1
                })
            }
        });
    }
}

MakeYourCase.id = 'make-your-case';

module.exports = MakeYourCase;
