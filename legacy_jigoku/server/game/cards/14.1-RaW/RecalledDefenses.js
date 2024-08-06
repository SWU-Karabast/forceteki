const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes, Players } = require('../../Constants');

class RecalledDefenses extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a card to your stronghold',
            target: {
                location: Locations.Provinces,
                controller: Players.Self,
                cardCondition: (card, context) => card.type !== CardTypes.Province && card !== context.source,
                gameAction: AbilityDsl.actions.moveCard({ destination: Locations.StrongholdProvince })
            },
            effect: 'move {1} to their stronghold province',
            effectArgs: context => [context.target]
        });
    }
}

RecalledDefenses.id = 'recalled-defenses';

module.exports = RecalledDefenses;
