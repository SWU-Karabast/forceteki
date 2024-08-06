const DrawCard = require('../../drawcard.js');
const { CardTypes, Players, AbilityTypes, TargetModes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const isCopyInPlay = function(card, context) {
    return context.game.findAnyCardsInPlay(c => c.name === card.name).length > 0;
};

const ancestralSightCost = function () {
    return {
        action: { name: 'ancestralSightCost' },
        getActionName(context) { // eslint-disable-line no-unused-vars
            return 'ancestralSightCost';
        },
        getCostMessage: function (context) { // eslint-disable-line no-unused-vars
            return ['returning {0} to the bottom of the dynasty deck'];
        },
        canPay: function (context) {
            let discardPile = context.player.dynastyDiscardPile;
            if(!discardPile) {
                return false;
            }
            return discardPile.some(card => isCopyInPlay(card, context));
        },
        resolve: function (context, result) {
            context.game.promptForSelect(context.player, {
                activePromptTitle: 'Choose a card to return to your deck',
                context: context,
                mode: TargetModes.Single,
                location: Locations.DynastyDiscardPile,
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) => isCopyInPlay(card, context),
                onSelect: (player, card) => {
                    context.costs.ancestralSightCost = card;
                    return true;
                },
                onCancel: () => {
                    result.cancelled = true;
                    return true;
                }
            });
        },
        payEvent: function (context) {
            let action = context.game.actions.returnToDeck({ target: context.costs.ancestralSightCost, bottom: true, location: Locations.DynastyDiscardPile });
            return action.getEvent(context.costs.ancestralSightCost, context);
        },
        promptsPlayer: true
    };
};

class AncestralSight extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            trait: 'shugenja'
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Put a fate on a character',
                cost: ancestralSightCost(),
                printedAbility: false,
                cannotTargetFirst: true,
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: (card, context) => {
                        return !context.costs.ancestralSightCost || context.costs.ancestralSightCost && card.name === context.costs.ancestralSightCost.name;
                    },
                    gameAction: AbilityDsl.actions.placeFate(context => ({ origin: context.player }))
                }
            })
        });
    }
}

AncestralSight.id = 'ancestral-sight';

module.exports = AncestralSight;
