const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes, Elements } = require('../../Constants');

const elementKey = 'isawa-eju-air';

class IsawaEju extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard all cards in a province and refill it faceup',
            condition: context => this.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(context.player),
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province
            },
            gameAction: AbilityDsl.actions.moveCard(context => ({
                destination: Locations.DynastyDiscardPile,
                target: context.target.controller.getDynastyCardsInProvince(context.target.location)
            })),
            effect: 'discard {1} and refill the province faceup',
            effectArgs: context => [context.target.controller.getDynastyCardsInProvince(context.target.location)],
            then: context => ({
                gameAction: AbilityDsl.actions.refillFaceup(() => ({
                    target: context.target.controller,
                    location: context.target.location
                }))
            }),
            limit: AbilityDsl.limit.perRound(3)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Air
        });
        return symbols;
    }
}

IsawaEju.id = 'isawa-eju';

module.exports = IsawaEju;
