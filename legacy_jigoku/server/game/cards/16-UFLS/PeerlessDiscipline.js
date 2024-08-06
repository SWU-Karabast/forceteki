const DrawCard = require('../../drawcard.js');
const { Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class PeerlessDiscipline extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give each character +1 military and Bushi',
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                target: context.player.cardsInPlay.filter(() => true),
                effect: [
                    AbilityDsl.effects.modifyMilitarySkill(1),
                    AbilityDsl.effects.addTrait('bushi')
                ],
                duration: Durations.UntilEndOfPhase
            })),
            effect: 'give all characters they control +1{1} and the Bushi trait',
            effectArgs: ['military']
        });
    }
}

PeerlessDiscipline.id = 'peerless-discipline';

module.exports = PeerlessDiscipline;
