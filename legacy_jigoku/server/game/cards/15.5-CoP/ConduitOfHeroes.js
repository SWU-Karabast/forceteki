const DrawCard = require('../../drawcard.js');
const { CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const conduitOfHeroesCost = function () {
    return {
        action: { name: 'conduitOfHeroesCost' },
        getActionName(context) { // eslint-disable-line no-unused-vars
            return 'conduitOfHeroesCost';
        },
        getCostMessage: function (context) { // eslint-disable-line no-unused-vars
            if(context.player.opponent && context.player.honor >= context.player.opponent.honor + 5) {
                return undefined;
            }
            return ['bowing {0}'];
        },
        canPay: function (context) {
            return context.player.opponent && context.player.honor >= context.player.opponent.honor + 5 ||
                context.game.actions.bow().canAffect(context.source, context);
        },
        resolve: function (context) {
            context.costs.conduitOfHeroesCost = context.source;
            context.costs.skipConduitCost = context.player.opponent && context.player.honor >= context.player.opponent.honor + 5;
        },
        payEvent: function (context) {
            if(!context.costs.skipConduitCost) {
                let events = [];

                let bowAction = context.game.actions.bow({ target: context.source });
                events.push(bowAction.getEvent(context.source, context));
                return events;
            }

            let action = context.game.actions.handler(); //this is a do-nothing event to allow you to "pay" a non-payment cost
            return action.getEvent(context.player, context);

        }
    };
};

class ConduitOfHeroes extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a character +3/+1/+1',
            cost: conduitOfHeroesCost(),
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card, context) => card !== context.source,
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    effect: [
                        AbilityDsl.effects.modifyMilitarySkill(3),
                        AbilityDsl.effects.modifyPoliticalSkill(1),
                        AbilityDsl.effects.modifyGlory(1)
                    ]
                }))
            },
            effect: 'grant {0} +3{1}/+1{2}/+1{3} until the end of the conflict',
            effectArgs: ['military', 'political', 'glory']
        });
    }
}

ConduitOfHeroes.id = 'conduit-of-heroes';

module.exports = ConduitOfHeroes;
