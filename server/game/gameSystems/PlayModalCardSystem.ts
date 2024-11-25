import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { GameEvent } from '../core/event/GameEvent';
import { EventName } from '../core/Constants';
import { IChoicesInterface } from '../TargetInterfaces';

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
        let listOfChoices = properties.choices;
        if (typeof properties.choices === 'function') {
            listOfChoices = properties.choices(context);
        }

        // recursively calls the function and removes handlers from the list until the player can't make anymore choices.
        const choiceHandler = (player, choices, amountOfChoices: number) => {
            if (amountOfChoices === 0) {
                return;
            }
            // setup the choices for the modal card
            context.game.promptWithHandlerMenu(player, {
                activePromptTitle: `Choose ${amountOfChoices} of the following`,
                choices: Object.keys(choices),
                handlers: Object.entries(choices).map((choice) => () => this.pushEvent(
                    events,
                    choice,
                    context,
                    amountOfChoices,
                    choices,
                    choiceHandler
                ))
            });
        };
        choiceHandler(context.player, listOfChoices, properties.amountOfChoices);
    }

    // Helper method for pushing the correct event into the events array.
    private pushEvent(
        events: GameEvent[],
        choice: any,
        context: TContext,
        amountOfChoices: number,
        choices,
        choiceHandler: (player: any, choices: IChoicesInterface, amountOfChoices: number) => void,
    ) {
        const [prompt, gameSystem] = choice;
        // Add generate event to perform the gameSystem selected
        context.game.queueSimpleStep(() => {
            const eventsForThisAction = [];
            gameSystem.queueGenerateEventGameSteps(eventsForThisAction, context);
            context.game.queueSimpleStep(() => {
                for (const event of eventsForThisAction) {
                    events.push(event);
                }
                // If this isn't the last choice open a seperate event window
                if (amountOfChoices !== 1) {
                    context.game.openEventWindow(eventsForThisAction);
                }
            }, `open event window for playModalCard system ${gameSystem.name}`);
        }, `check and add events for playModalCard system ${gameSystem.name}`);

        // remove the selected choice from the list
        const { [prompt]: removedKey, ...reducedListOfChoices } = choices;
        choiceHandler(context.player, reducedListOfChoices, (amountOfChoices - 1));
    }
}