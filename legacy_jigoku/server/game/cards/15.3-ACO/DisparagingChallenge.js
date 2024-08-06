const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { DuelTypes } = require('../../Constants');

class DisparagingChallenge extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            initiateDuel: {
                type: DuelTypes.Political,
                targetCondition: card => !card.isParticipating(),
                gameAction: duel => AbilityDsl.actions.multiple([
                    AbilityDsl.actions.sendHome({ target: duel.loser }),
                    AbilityDsl.actions.moveToConflict({ target: duel.loser })
                ])
            }
        });
    }
}

DisparagingChallenge.id = 'disparaging-challenge';

module.exports = DisparagingChallenge;
