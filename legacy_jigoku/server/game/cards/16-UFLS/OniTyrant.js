const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

const oniTyrantCost = function () {
    return {
        canPay: function () {
            return true;
        },
        resolve: function (context, result) {
            let creatures = context.player.outsideTheGameCards;
            creatures = creatures.filter(card => card.printedCost <= 2 && context.game.actions.putIntoConflict().canAffect(card, context));
            context.game.promptWithHandlerMenu(context.player, {
                activePromptTitle: 'Select a creature to summon',
                source: context.source,
                cards: creatures,
                choices: ['Cancel'],
                cardHandler: card => {
                    context.costs.oniTyrantCostCreature = card;
                },
                handlers: [
                    () => {
                        context.costs.oniTyrantCostCreature = undefined;
                        result.cancelled = true;
                        return true;
                    }
                ]
            });
        },
        payEvent: function (context) {
            if(context.costs.oniTyrantCostCreature) {
                const oni = context.costs.oniTyrantCostCreature;
                const copy = new oni.constructor(context.player, oni.cardData);
                context.game.allCards.push(copy);
                context.costs.oniTyrantCostCreature = copy;

                let action = context.game.actions.handler(); //this is a do-nothing event since the cost isn't really a cost
                return action.getEvent(context.player, context);
            }
            return [];
        },
        promptsPlayer: true
    };
};

class OniTyrant extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Summon a Shadowlands Creature',
            cost: [
                AbilityDsl.costs.payHonor(1),
                oniTyrantCost()
            ],
            condition: context => context.source.isParticipating(),
            gameAction: AbilityDsl.actions.putIntoConflict(context => ({
                target: context.costs.oniTyrantCostCreature || context.player.outsideTheGameCards[1]
            })),
            effect: 'summon a{2} {1} from the depths of the Shadowlands!',
            effectArgs: context => {
                var testStr = context.costs.oniTyrantCostCreature.name;
                var vowelRegex = '^[aieouAIEOU].*';
                var matched = testStr.match(vowelRegex);
                return [
                    context.costs.oniTyrantCostCreature,
                    matched ? 'n' : ''
                ];
            }
        });
    }
}

OniTyrant.id = 'oni-tyrant';

module.exports = OniTyrant;
