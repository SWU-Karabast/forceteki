const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { DuelTypes } = require('../../Constants');

class Heresy extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            initiateDuel: {
                type: DuelTypes.Political,
                opponentChoosesChallenger: true,
                message: 'remove a fate from {0}',
                messageArgs: duel => [duel.loser],
                gameAction: duel => AbilityDsl.actions.removeFate({
                    target: duel.loser,
                    amount: 1
                })
            }
        });
    }
}

Heresy.id = 'heresy';

module.exports = Heresy;
