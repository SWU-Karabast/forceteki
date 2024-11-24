import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { GameEvent } from '../core/event/GameEvent';
import { EventName } from '../core/Constants';
import { IChoicesInterface } from '../TargetInterfaces';
import { GameSystem } from '../core/gameSystem/GameSystem';


export interface IPlayModalCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    amountOfChoices: number;
    choices: IChoicesInterface | ((context: TContext) => IChoicesInterface);
}

export class PlayModalCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPlayModalCardProperties> {
    public override readonly name = 'playModalCardSystem';
    protected override readonly eventName = EventName.OnPlayModalCard;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const properties = this.generatePropertiesFromContext(context);
        let actualChoices = properties.choices;

        if (typeof properties.choices === 'function') {
            actualChoices = properties.choices(context);
        }

        // recursively calls the function and removes handlers from the list until the player chose enough.
        const choiceHandler = (player, choices, amountOfChoices, properties) => {
            if (amountOfChoices === 0) {
                return;
            }
            // setup the choices for the modal card
            context.game.promptWithHandlerMenu(player, {
                activePromptTitle: `Choose ${amountOfChoices} of the following`,
                choices: Object.keys(choices),
                handlers: Object.keys(choices).map((choice: string) => () => this.pushEvent(events, choice, context, choices, amountOfChoices, choiceHandler, properties))
            });
        };
        choiceHandler(context.player, actualChoices, properties.amountOfChoices, properties);
    }

    // Helper method for pushing the move card event into the events array.
    private pushEvent(
        events: GameEvent[],
        choice: string,
        context: TContext,
        choices: any,
        amountOfChoices: number,
        choiceHandler: (player: any, choices: IChoicesInterface, amountOfChoices: number, properties: any) => void,
        properties: any,
    ) {
        // this is where we need to get rid of the choice
        context.game.queueSimpleStep(() => {
            const eventsForThisAction = [];
            choices[choice].queueGenerateEventGameSteps(eventsForThisAction, context);
            context.game.queueSimpleStep(() => {
                for (const event of eventsForThisAction) {
                    events.push(event);
                }
                if (amountOfChoices !== 1) {
                    context.game.openEventWindow(eventsForThisAction);
                }
            }, `open event window for playModalCard system ${choices[choice].name}`);
        }, `check and add events for playModalCard system ${choices[choice].name}`);
        const { [choice]: removedKey, ...reducedChoices } =
                choices;
        choiceHandler(context.player, reducedChoices, (amountOfChoices - 1), properties);
    }
}