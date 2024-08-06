const DrawCard = require('../../../drawcard.js');
const { TargetModes, Locations } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class HeraldOfJade extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Discard a status token and gain 1 honor',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            target: {
                mode: TargetModes.Token,
                location: Locations.Any,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.discardStatusToken(),
                    AbilityDsl.actions.gainHonor(context => ({
                        target: context.player,
                        amount: 1
                    }))
                ])
            },
            effect: 'discard {1}\'s {2} and gain 1 honor',
            effectArgs: context => [
                context.token[0].card,
                context.token
            ]
        });
    }
}

HeraldOfJade.id = 'herald-of-jade';

module.exports = HeraldOfJade;
