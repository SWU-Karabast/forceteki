const DrawCard = require('../../drawcard.js');
const { AbilityTypes, CardTypes, Players} = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class YogoJunzo extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Remove all fate from a character',
                target: {
                    cardType: CardTypes.Character,
                    gameAction: AbilityDsl.actions.removeFate(context => ({
                        amount: context.target.getFate()
                    }))
                },
                effect: 'remove all fate from {0}'
            })
        });

        this.action({
            title:'Return any amount of fate from a character you control',
            target:{
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.menuPrompt(context => ({
                    activePromptTitle: 'Select fate amount:',
                    choices: Array.from(Array(context.target.getFate()), (x, i) => (i + 1).toString()),
                    choiceHandler: (choice, displayMessage) => {
                        if(displayMessage) {
                            this.game.addMessage('{0} chooses to move {1} fate from {2} to {3}\'s pool', context.player, choice, context.target, context.player);
                        }
                        return { target: context.target, amount: parseInt(choice), recipient:context.target.controller };
                    },
                    gameAction: AbilityDsl.actions.removeFate()
                }))
            }
        });
    }
}

YogoJunzo.id = 'yogo-junzo';

module.exports = YogoJunzo;
