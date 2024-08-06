const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { PlayTypes } = require('../../Constants');

class KhanbulakBenefactor extends DrawCard {
    setupCardAbilities() {
        this.dire({
            condition: context => context.source.isParticipating(),
            effect: AbilityDsl.effects.reduceCost({
                amount: 1,
                playingTypes: PlayTypes.PlayFromHand
            })
        });

        this.reaction({
            title: 'Draw 2 cards',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.draw({ amount: 2 })
        });
    }
}

KhanbulakBenefactor.id = 'khanbulak-benefactor';

module.exports = KhanbulakBenefactor;
