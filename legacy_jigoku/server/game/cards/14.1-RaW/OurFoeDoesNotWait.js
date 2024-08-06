const DrawCard = require('../../drawcard.js');
const { Locations, Players, CardTypes, Decks } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class OurFoeDoesNotWait extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Place a card from your deck faceup on a province',
            when: {
                onConflictPass: (event, context) => event.conflict.attackingPlayer === context.player

            },
            max: AbilityDsl.limit.perConflictOpportunity(1),
            effect: 'look at the top eight cards of their dynasty deck',
            target: {
                cardType: CardTypes.Province,
                controller: Players.Self,
                location: Locations.Provinces,
                cardCondition: card => card.location !== Locations.StrongholdProvince && !card.isBroken
            },
            gameAction: AbilityDsl.actions.deckSearch(context => ({
                amount: 8,
                deck: Decks.DynastyDeck,
                gameAction: AbilityDsl.actions.moveCard({
                    faceup: true,
                    destination: context.target.location
                })
            }))
        });
    }
}

OurFoeDoesNotWait.id = 'our-foe-does-not-wait';

module.exports = OurFoeDoesNotWait;
