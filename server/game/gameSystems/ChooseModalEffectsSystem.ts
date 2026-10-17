import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import { MetaEventName, RelativePlayer } from '../core/Constants';
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

    /** The player who chooses the effects, relative to the ability's controller. Defaults to {@link RelativePlayer.Self}. */
    choosingPlayer?: RelativePlayer;
}

export class ChooseModalEffectsSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPlayModalCardProperties> {
    public override readonly name = 'ChooseModalEffectsSystem';
    public override readonly eventName = MetaEventName.ChooseModalEffects;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    /**
     * Legal if at least one option would not be marked as having no effect in the prompt. Options are offered even
     * if they won't change the game state, so the game state change requirement is intentionally not applied here.
     */
    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IPlayModalCardProperties> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return Object.values(this.getChoices(properties, context))
            .some((system) => this.modalChoiceHasAnyLegalEffect(system, context));
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const properties = this.generatePropertiesFromContext(context);
        const listOfAvailableEffects = this.getChoices(properties, context);
        const choosingPlayer = properties.choosingPlayer === RelativePlayer.Opponent
            ? context.player.opponent
            : context.player;

        // recursively calls the function and removes handlers from the list until the player can't make anymore choices.
        const choiceHandler = (
            player: Player,
            listOfAvailableEffects: IChoicesInterface,
            amountOfRemainingChoices: number
        ) => {
            if (amountOfRemainingChoices === 0) {
                return;
            }

            const effectsToChoose = this.getEffectsToChooseText(properties, amountOfRemainingChoices);

            context.game.promptWithModalEffectSelection(player, {
                title: `Choose ${effectsToChoose} for ${context.source.title}`,
                description: this.getPromptDescription(properties, player, context),
                waitingPromptTitle: `Waiting for opponent to choose ${effectsToChoose} for ${context.source.title}`,
                sourceCard: getTriggerSourceCardSummary(context.source),
                choices: Object.entries(listOfAvailableEffects).map(([label, system]) => ({
                    title: label,
                    hasLegalEffects: () => this.modalChoiceHasAnyLegalEffect(system, context),
                    handler: () => this.pushEvent(
                        events,
                        player,
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
        choiceHandler(choosingPlayer, listOfAvailableEffects, properties.amountOfChoices);
    }

    // Helper method for pushing the correct event into the events array.
    private pushEvent(
        events: GameEvent[],
        choosingPlayer: Player,
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
            context.game.addMessage('{0} chooses "{1}"', choosingPlayer, selectedPrompt);
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
        choiceHandler(choosingPlayer, nextListOfAvailableEffects, (amountOfRemainingChoices - 1));
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

    private getChoices(properties: IPlayModalCardProperties, context: TContext): IChoicesInterface {
        return typeof properties.choices === 'function'
            ? properties.choices(context)
            : properties.choices;
    }

    private getEffectsToChooseText(properties: IPlayModalCardProperties, amountOfRemainingChoices: number): string {
        if (properties.amountOfChoices === 1) {
            return 'an effect';
        }

        return `${amountOfRemainingChoices} ${amountOfRemainingChoices === 1 ? 'effect' : 'effects'}`;
    }

    private getPromptDescription(properties: IPlayModalCardProperties, choosingPlayer: Player, context: TContext): string | undefined {
        const descriptions: string[] = [];

        if (choosingPlayer !== context.player) {
            descriptions.push('You\'re choosing for your opponent\'s ability.');
        }

        if (properties.amountOfChoices > 1) {
            descriptions.push(properties.canChooseSameOptionMoreThanOnce
                ? 'You may choose the same option more than once.'
                : 'Each option can only be chosen once.');
        }

        return descriptions.length > 0 ? descriptions.join(' ') : undefined;
    }

    private modalChoiceHasAnyLegalEffect(system: GameSystem, context: TContext): boolean {
        return system.hasLegalTarget(context);
    }
}