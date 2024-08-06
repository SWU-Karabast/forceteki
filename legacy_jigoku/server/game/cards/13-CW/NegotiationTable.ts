import type { AbilityContext } from '../../AbilityContext';
import AbilityDsl from '../../abilitydsl';
import { CardTypes, Players } from '../../Constants';
import DrawCard from '../../drawcard';

export default class NegotiationTable extends DrawCard {
    static id = 'negotiation-table';

    public setupCardAbilities() {
        this.action({
            title: 'Make opponent pick from several options',
            condition: (context) => context.player.opponent !== undefined,
            handler: (context) => {
                let choices = [];
                let handlers = [];

                let drawChoice = 'Draw 1 card';
                let drawHandler = () => {
                    choices.splice(choices.indexOf(drawChoice), 1);
                    handlers.splice(handlers.indexOf(drawHandler), 1);
                    this.getDrawChoice(context);
                    this.getHandlerMenu(context, choices, handlers);
                };
                let readyChoice = 'Choose and ready a character';
                let readyHandler = () => {
                    choices.splice(choices.indexOf(readyChoice), 1);
                    handlers.splice(handlers.indexOf(readyHandler), 1);
                    this.getReadyChoice(context);
                    this.getHandlerMenu(context, choices, handlers);
                };
                let fateChoice = 'Gain 1 fate';
                let fateHandler = () => {
                    choices.splice(choices.indexOf(fateChoice), 1);
                    handlers.splice(handlers.indexOf(fateHandler), 1);
                    this.getFateChoice(context);
                    this.getHandlerMenu(context, choices, handlers);
                };
                let doneChoice = 'Done';
                let doneHandler = () => {
                    this.getDoneChoice(context);
                };

                choices.push(drawChoice);
                choices.push(readyChoice);
                choices.push(fateChoice);
                choices.push(doneChoice);

                handlers.push(drawHandler);
                handlers.push(readyHandler);
                handlers.push(fateHandler);
                handlers.push(doneHandler);

                this.getHandlerMenu(context, choices, handlers);
            }
        });
    }

    getHandlerMenu(context: AbilityContext, choices: any[], handlers: any[]) {
        this.game.promptWithHandlerMenu(context.player.opponent, {
            activePromptTite: 'Choose an action',
            source: this,
            choices: choices,
            handlers: handlers
        });
    }

    getDrawChoice(context: AbilityContext) {
        this.game.addMessage('{0} chooses to have each player draw a card', context.player.opponent);

        AbilityDsl.actions
            .draw((context) => ({
                target: context.player.opponent,
                amount: 1
            }))
            .resolve(context.player.opponent, context);
        AbilityDsl.actions
            .draw((context) => ({
                target: context.player,
                amount: 1
            }))
            .resolve(context.player, context);
    }

    getReadyChoice(context: AbilityContext) {
        this.game.addMessage('{0} chooses to have each player ready a character', context.player.opponent);
        let bowedCharacters =
            context.player.cardsInPlay.filter((a) => a.type === CardTypes.Character && a.bowed).length +
            context.player.opponent.cardsInPlay.filter((a) => a.type === CardTypes.Character && a.bowed).length;

        if (bowedCharacters > 0) {
            AbilityDsl.actions
                .selectCard((context) => ({
                    player: Players.Opponent,
                    cardType: CardTypes.Character,
                    targets: true,
                    message: '{0} chooses to ready {1}',
                    messageArgs: (card) => [context.player.opponent, card],
                    gameAction: AbilityDsl.actions.ready()
                }))
                .resolve(context.player.opponent, context);
        }

        //This is ugly, but it's needed to not deadlock the game
        if (bowedCharacters > 1) {
            AbilityDsl.actions
                .selectCard((context) => ({
                    player: Players.Self,
                    cardType: CardTypes.Character,
                    targets: true,
                    message: '{0} chooses to ready {1}',
                    messageArgs: (card) => [context.player, card],
                    gameAction: AbilityDsl.actions.ready()
                }))
                .resolve(context.player, context);
        }
    }

    getFateChoice(context: AbilityContext) {
        this.game.addMessage('{0} chooses to have each player gain a fate', context.player.opponent);

        AbilityDsl.actions
            .gainFate((context) => ({
                target: context.player.opponent,
                amount: 1
            }))
            .resolve(context.player.opponent, context);
        AbilityDsl.actions
            .gainFate((context) => ({
                target: context.player,
                amount: 1
            }))
            .resolve(context.player, context);
    }

    getDoneChoice(context: AbilityContext) {
        this.game.addMessage('{0} chooses not to do an action', context.player.opponent);
        return true;
    }
}
