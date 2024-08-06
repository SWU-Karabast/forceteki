const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

const accursedSummoningCost = function () {
    return {
        action: { name: 'accursedSummoningCost' },
        getActionName(context) { // eslint-disable-line no-unused-vars
            return 'accursedSummoningCost';
        },
        getCostMessage: function (context) { // eslint-disable-line no-unused-vars
            return ['losing {0} honor'];
        },
        canPay: function (context) {
            return context.game.actions.loseHonor().canAffect(context.player, context);
        },
        resolve: function (context, result) {
            let creatures = context.player.outsideTheGameCards;
            creatures = creatures.filter(card => context.game.actions.putIntoConflict().canAffect(card, context));

            const creaturesByCost = [[], [], [], [], []];
            creatures.forEach(creature => {
                creaturesByCost[creature.printedCost].push(creature);
            });
            context.costs.accursedSummoningCostCreature = undefined;
            result.cancelled = false;
            const promptForCost = () => context.game.promptWithHandlerMenu(context.player, {
                activePromptTitle: 'Select a fate cost',
                source: context.source,
                choices: ['1', '2', '3', '4', 'All', 'Cancel'],
                handlers: [
                    () => {
                        promptForCards(creaturesByCost[1]);
                    },
                    () => {
                        promptForCards(creaturesByCost[2]);
                    },
                    () => {
                        promptForCards(creaturesByCost[3]);
                    },
                    () => {
                        promptForCards(creaturesByCost[4]);
                    },
                    () => {
                        promptForCards(creatures);
                    },
                    () => {
                        context.costs.accursedSummoningCostCreature = undefined;
                        result.cancelled = true;
                        return true;
                    }
                ]
            });

            const promptForCards = (creatures) => context.game.promptWithHandlerMenu(context.player, {
                activePromptTitle: 'Select a creature to summon',
                source: context.source,
                cards: creatures,
                choices: ['Back', 'Cancel'],
                cardHandler: card => {
                    context.costs.accursedSummoningCostCreature = card;
                    context.costs.accursedSummoningCost = card.printedCost;
                },
                handlers: [
                    () => {
                        promptForCost();
                        return true;
                    },
                    () => {
                        context.costs.accursedSummoningCostCreature = undefined;
                        result.cancelled = true;
                        return true;
                    }
                ]
            });

            promptForCost();
        },
        payEvent: function (context) {
            if(context.costs.accursedSummoningCostCreature) {
                const oni = context.costs.accursedSummoningCostCreature;
                const copy = new oni.constructor(context.player, oni.cardData);
                context.game.allCards.push(copy);
                context.costs.accursedSummoningCostCreature = copy;

                let events = [];
                const honorAmount = context.costs.accursedSummoningCost;
                let honorAction = context.game.actions.loseHonor({ target: context.player, amount: honorAmount });
                events.push(honorAction.getEvent(context.player, context));
                return events;
            }
            return [];
        },
        promptsPlayer: true
    };
};

class AccursedSummoning extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Summon a Shadowlands Creature',
            cost: [accursedSummoningCost()],
            condition: context => context.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.putIntoConflict(context => ({
                target: context.costs.accursedSummoningCostCreature || context.player.outsideTheGameCards[1]
            })),
            effect: 'summon a{2} {1} from the depths of the Shadowlands!',
            effectArgs: context => {
                var testStr = context.costs.accursedSummoningCostCreature.name;
                var vowelRegex = '^[aieouAIEOU].*';
                var matched = testStr.match(vowelRegex);
                return [
                    context.costs.accursedSummoningCostCreature,
                    matched ? 'n' : ''
                ];
            }
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

AccursedSummoning.id = 'accursed-summoning';

module.exports = AccursedSummoning;
