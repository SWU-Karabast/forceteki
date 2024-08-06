const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations } = require('../../Constants');

class MushinNoShin extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel an ability',
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    event.context.ability.isTriggeredAbility() &&
                    event.cardTargets.some(
                        (card) =>
                            card.attachments.length >= 2 &&
                            card.controller === context.player &&
                            card.location === Locations.PlayArea
                    )
            },
            gameAction: AbilityDsl.actions.cancel()
        });
    }
}

MushinNoShin.id = 'mushin-no-shin';

module.exports = MushinNoShin;
