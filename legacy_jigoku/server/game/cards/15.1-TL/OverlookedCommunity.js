const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Locations, TargetModes } = require('../../Constants');

class OverlookedCommunity extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a status token',
            cost: AbilityDsl.costs.returnRings(1),
            target: {
                mode: TargetModes.Token,
                cardType: CardTypes.Character,
                location: Locations.PlayArea,
                gameAction: AbilityDsl.actions.discardStatusToken()
            }
        });
    }
}

OverlookedCommunity.id = 'overlooked-community';

module.exports = OverlookedCommunity;
