import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import { MetaEventName } from '../core/Constants';
import type { IChoicesInterface } from '../TargetInterfaces';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import { getTriggerSourceCardSummary } from '../core/gameSteps/abilityWindow/TriggerWindowBase';
import type { Player } from '../core/Player';
import type { MsgArg } from '../core/chat/GameChat';

export interface IPlayModalCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    amountOfChoices: number;
    choices: IChoicesInterface | ((context: TContext) => IChoicesInterface);

    /** If true, the player may select the same option more than once. Defaults to false. */
    canChooseSameOptionMoreThanOnce?: boolean;
}

export class ChooseModalEffectsSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPlayModalCardProperties> {
    public override readonly name = 'ChooseModalEffectsSystem';
    public override readonly eventName = MetaEventName.ChooseModalEffects;

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

            context.game.promptWithModalEffectSelection(player, {
                title: `Choose ${amountOfRemainingChoices} ${amountOfRemainingChoices === 1 ? 'effect' : 'effects'} for ${context.source.title}`,
                description: this.getPromptDescription(properties),
                sourceCard: getTriggerSourceCardSummary(context.source),
                choices: Object.entries(listOfAvailableEffects).map(([label, system]) => ({
                    title: label,
                    hasLegalEffects: () => this.modalChoiceHasAnyLegalEffect(system, context),
                    handler: () => this.pushEvent(
                        events,
                        label,
                        system,
                        context,
                        amountOfRemainingChoices,
                        listOfAvailableEffects,
                        choiceHandler,
                        !!properties.canChooseSameOptionMoreThanOnce
                    )
                }))
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
        canChooseSameOptionMoreThanOnce: boolean,
    ) {
        // Add generate event to perform the gameSystem selected
        context.game.queueSimpleStep(() => {
            const eventsForThisAction = [];
            context.game.addMessage('{0} chooses "{1}"', context.source.owner, selectedPrompt);
            this.addOnSelectEffectMessage(context, selectedSystem);
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

        // remove the selected choice from the list, unless the player is allowed to choose the same option again
        const nextListOfAvailableEffects = canChooseSameOptionMoreThanOnce
            ? listOfAvailableEffects
            : (() => {
                const { [selectedPrompt]: _removedKey, ...reducedListOfAvailableEffects } = listOfAvailableEffects;
                return reducedListOfAvailableEffects;
            })();
        choiceHandler(context.player, nextListOfAvailableEffects, (amountOfRemainingChoices - 1));
    }

    private addOnSelectEffectMessage(
        context: TContext,
        system: GameSystem
    ) {
        const [effectMessage, effectArgs] = system.getEffectMessage(context);

        if (!effectMessage) {
            return;
        }

        const messageArgs: MsgArg[] = [context.player, ' uses ', context.source, ' to ', { format: effectMessage, args: effectArgs }];
        context.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);
    }

    private getPromptDescription(properties: IPlayModalCardProperties): string | undefined {
        if (properties.amountOfChoices <= 1) {
            return undefined;
        }

        return properties.canChooseSameOptionMoreThanOnce
            ? 'You may choose the same option more than once.'
            : 'Each option can only be chosen once.';
    }

    private modalChoiceHasAnyLegalEffect(system: GameSystem, context: TContext): boolean {
        return system.hasLegalTarget(context);
    }
}