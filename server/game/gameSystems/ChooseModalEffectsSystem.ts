import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { GameEvent } from '../core/event/GameEvent';
import { MetaEventName } from '../core/Constants';
import { IChoicesInterface } from '../TargetInterfaces';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type Player from '../core/Player';

export interface IPlayModalCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    amountOfChoices: number;
    choices: IChoicesInterface | ((context: TContext) => IChoicesInterface);
}

export class ChooseModalEffectsSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPlayModalCardProperties> {
    public override readonly name = 'ChooseModalEffectsSystem';
    protected override readonly eventName = MetaEventName.ChooseModalEffects;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const properties = this.generatePropertiesFromContext(context);
        const listOfAvailableEffects =
            typeof properties.choices === 'function'
                ? properties.choices(context)
                : properties.choices;

        // recursively calls the function and removes handlers from the list until the player can't make anymore choices.
        const choiceHandler = (
            player: Player,
            listOfAvailableEffects: IChoicesInterface,
            amountOfRemainingChoices: number
        ) => {
            if (amountOfRemainingChoices === 0) {
                return;
            }
            // setup the choices for the modal card
            context.game.promptWithHandlerMenu(player, {
                activePromptTitle: `Choose ${amountOfRemainingChoices} of the following`,
                choices: Object.keys(listOfAvailableEffects),
                handlers: Object.entries(listOfAvailableEffects).map((selectedEffect: [string, GameSystem]) => () => this.pushEvent(
                    events,
                    selectedEffect[0],
                    selectedEffect[1],
                    context,
                    amountOfRemainingChoices,
                    listOfAvailableEffects,
                    choiceHandler
                ))
            });
        };
        choiceHandler(context.player, listOfAvailableEffects, properties.amountOfChoices);
    }

    // Helper method for pushing the correct event into the events array.
    private pushEvent(
        events: GameEvent[],
        selectedPrompt: string,
        selectedSystem: GameSystem,
        context: TContext,
        amountOfRemainingChoices: number,
        listOfAvailableEffects: IChoicesInterface,
        choiceHandler: (player: Player, choices: IChoicesInterface, amountOfChoices: number) => void,
    ) {
        // Add generate event to perform the gameSystem selected
        context.game.queueSimpleStep(() => {
            const eventsForThisAction = [];
            selectedSystem.queueGenerateEventGameSteps(eventsForThisAction, context);
            context.game.queueSimpleStep(() => {
                for (const event of eventsForThisAction) {
                    events.push(event);
                }
                // If this isn't the last choice open a seperate event window
                if (amountOfRemainingChoices !== 1) {
                    context.game.openEventWindow(eventsForThisAction);
                }
            }, `open event window for playModalCard system ${selectedSystem.name}`);
        }, `check and add events for playModalCard system ${selectedSystem.name}`);

        // remove the selected choice from the list
        const { [selectedPrompt]: removedKey, ...reducedListOfAvailableEffects } = listOfAvailableEffects;
        choiceHandler(context.player, reducedListOfAvailableEffects, (amountOfRemainingChoices - 1));
    }
}