const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players, Durations, TargetModes, Locations } = require('../../Constants');
const DrawCard = require('../../drawcard.js');

const agreeableCost = () => ({
    action: { name: 'agreeableArrangementCost' },
    getActionName(context) { // eslint-disable-line no-unused-vars
        return 'agreeableArrangementCost';
    },
    getCostMessage: function (context) { // eslint-disable-line no-unused-vars
        return ['giving {1} control of {0}', context.player.opponent];
    },
    canPay: function(context) {
        return context.player.opponent && context.player.cardsInPlay.some(card => card.printedCost >= 2 && !card.bowed && !card.anotherUniqueInPlay(context.player.opponent));
    },
    resolve: function (context, result) {
        context.game.promptForSelect(context.player, {
            activePromptTitle: 'Choose a card to give to your opponent',
            context: context,
            mode: TargetModes.Single,
            numCards: 1,
            location: Locations.PlayArea,
            cardType: CardTypes.Character,
            controller: Players.Self,
            cardCondition: card => card.printedCost >= 2 && !card.bowed && !card.anotherUniqueInPlay(context.player.opponent),
            onSelect: (player, card) => {
                context.costs.agreeableArrangementCost = card;
                return true;
            },
            onCancel: () => {
                result.cancelled = true;
                return true;
            }
        });
    },
    payEvent: function(context) {
        const card = context.costs.agreeableArrangementCost;
        const action = context.game.actions.cardLastingEffect(context => ({
            target: card,
            effect: AbilityDsl.effects.takeControl(context.player.opponent),
            duration: Durations.Custom
        }));
        const events = [];
        events.push(action.getEvent(card, context));
        return events;
    }
});

class AnAgreeableArrangement extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow a non-champion',
            cost: [agreeableCost()],
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: card => !card.hasTrait('champion'),
                activePromptTitle: 'Bow a non-champion',
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}

AnAgreeableArrangement.id = 'an-agreeable-arrangement';

module.exports = AnAgreeableArrangement;
