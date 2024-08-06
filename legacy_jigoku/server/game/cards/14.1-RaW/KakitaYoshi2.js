const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, CardTypes } = require('../../Constants.js');

class KakitaYoshi2 extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Dishonor characters',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller &&
                    context.source.isAttacking() &&
                    event.conflict.conflictType === 'political'
            },
            target: {
                mode: TargetModes.UpToVariable,
                numCardsFunc: (context) => context.player.getNumberOfFaceupProvinces(),
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }
}

KakitaYoshi2.id = 'kakita-yoshi-2';

module.exports = KakitaYoshi2;
