const DrawCard = require('../../drawcard.js');
const { Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class BayushiTraitor extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            condition: context => context.player.opponent && context.source.controller !== context.source.owner,
            effect: [
                AbilityDsl.effects.cannotParticipateAsAttacker(),
                AbilityDsl.effects.cannotParticipateAsDefender()
            ]
        });

        this.persistentEffect({
            location: Locations.Any,
            targetLocation: Locations.Any,
            effect: AbilityDsl.effects.cardCannot('putIntoConflict')
        });

        this.persistentEffect({
            location: Locations.Any,
            targetLocation: Locations.Any,
            effect: AbilityDsl.effects.entersPlayForOpponent()
        });
    }
}

BayushiTraitor.id = 'bayushi-traitor';

module.exports = BayushiTraitor;
