const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class RootOutHeresy extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a card at random from your oppoent\'s hand',
            condition: () => this.game.isDuringConflict('political'),
            gameAction: AbilityDsl.actions.discardAtRandom(context => ({ target: context.player.opponent })),
            then: context => ({
                gameAction: AbilityDsl.actions.selectCard(({
                    activePromptTitle: 'Choose an attacked province',
                    hidePromptIfSingleCard: true,
                    cardType: CardTypes.Province,
                    location: Locations.Provinces,
                    cardCondition: card => card.isConflictProvince(),
                    message: '{0} reduces the strength of {1} by {2}',
                    messageArgs: cards => [context.player, cards, this.getStrengthModifier(context)],
                    gameAction: AbilityDsl.actions.cardLastingEffect(() => {
                        let amount = this.getStrengthModifier(context);
                        return ({
                            effect: AbilityDsl.effects.modifyProvinceStrength(amount)
                        });
                    })
                }))
            })
        });
    }

    getStrengthModifier(context) {
        //Find the event
        if(context.events) {
            let event = context.events.find(a => a.name === 'onCardsDiscardedFromHand');
            if(event) {
                if(event.discardedCards && event.discardedCards.length > 0) {
                    //Grab the first one (this card should only discard one card)
                    let card = event.discardedCards[0];
                    let cost = card.printedCost;

                    return -1 * cost;
                }
            }
        }

        return 0;
    }
}

RootOutHeresy.id = 'root-out-heresy';

module.exports = RootOutHeresy;
