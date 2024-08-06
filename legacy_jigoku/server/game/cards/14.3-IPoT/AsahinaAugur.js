const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, Players, CardTypes } = require('../../Constants');

class AsahinaAugur extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            match: card => card.isDynasty && card.isFacedown(),
            effect: AbilityDsl.effects.canBeSeenWhenFacedown()
        });

        this.action({
            title: 'Discard a card in a province',
            target: {
                cardType: [CardTypes.Character, CardTypes.Holding, CardTypes.Event],
                location: Locations.Provinces,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.discardCard()
            },
            effect: 'discard {1} in {2}',
            effectArgs: context => [context.target.isFacedown() ? 'a facedown card' : context.target, context.target.location],
            limit: AbilityDsl.limit.perRound(3)
        });
    }
}

AsahinaAugur.id = 'asahina-augur';

module.exports = AsahinaAugur;
