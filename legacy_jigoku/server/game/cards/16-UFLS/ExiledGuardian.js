const DrawCard = require('../../drawcard.js');
const { TargetModes, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ExiledGuardian extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a status token off a character or province',
            cost: AbilityDsl.costs.sacrificeSelf(),
            target: {
                mode: TargetModes.Token,
                cardType: [CardTypes.Character, CardTypes.Province],
                location: Locations.Any,
                gameAction: AbilityDsl.actions.discardStatusToken()
            },
            effect: 'discard {1}\'s {2}',
            effectArgs: context => [
                context.token[0].card,
                context.token
            ]
        });
    }
}

ExiledGuardian.id = 'exiled-guardian';

module.exports = ExiledGuardian;
