const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class PhoenixTattoo extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.whileAttached({
            effect: AbilityDsl.effects.addTrait('tattooed')
        });

        this.persistentEffect({
            targetController: Players.Any,
            condition: context => context.source.parent && context.source.parent.isParticipating() && context.game.isDuringConflict(),
            match: (card, context) => card !== context.source.parent && card.isParticipating(),
            effect: AbilityDsl.effects.addKeyword('pride')
        });
    }
}

PhoenixTattoo.id = 'phoenix-tattoo';

module.exports = PhoenixTattoo;
