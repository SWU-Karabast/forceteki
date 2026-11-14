import type { AbilityContext, IAbilityPassOption } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import { MetaEventName, RelativePlayer } from '../core/Constants';
import type { IChoicesInterface } from '../TargetInterfaces';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import { getTriggerSourceCardSummary } from '../core/gameSteps/abilityWindow/TriggerWindowBase';
import type { Player } from '../core/Player';
import type { MsgArg } from '../core/chat/GameChat';
import type { PerChoiceLimit } from '../core/ability/AbilityLimit';

export interface IPlayModalCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    amountOfChoices: number;
    choices: IChoicesInterface | ((context: TContext) => IChoicesInterface);

    /** If true, the player may select the same option more than once. Defaults to false. */
    canChooseSameOptionMoreThanOnce?: boolean;

    /** The player who chooses the effects, relative to the ability's controller. Defaults to {@link RelativePlayer.Self}. */
    choosingPlayer?: RelativePlayer;

    /**
     * Limits how often each option can be chosen across resolutions of this ability, e.g. "Choose one that hasn't
     * been chosen this phase". Options that are at their limit are shown but can't be chosen, and an option counts as
     * used as soon as it is chosen, whether or not its effect changes the game state.
     *
     * Options are identified by their position in `choices`, so their labels may contain computed text, but the
     * number of options must not change between evaluations. Uses are tracked per ability step, so an ability should
     * contain at most one limited choice.
     */
    choiceLimit?: PerChoiceLimit;
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
        const choices = this.getChoices(properties, context);
        const choiceIds = this.getChoiceIds(properties, choices, context);
        return Object.entries(choices)
            .some(([label, system]) => this.isChoiceWithinLimit(properties, choiceIds, label, context) && this.modalChoiceHasAnyLegalEffect(system, context));
    }

    public override canShowAbilityPassOption(context: TContext, passingPlayer: Player): boolean {
        return this.getChoosingPlayer(this.generatePropertiesFromContext(context), context) === passingPlayer;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const properties = this.generatePropertiesFromContext(context);
        const allEffects = this.getChoices(properties, context);
        const choiceIds = this.getChoiceIds(properties, allEffects, context);
        const choosingPlayer = this.getChoosingPlayer(properties, context);

        // recursively prompts for the next choice until the player can't make any more choices. Every option is
        // shown each time; the ones that can't be chosen any more are shown as unavailable.
        const choiceHandler = (
            player: Player,
            chosenLabels: ReadonlySet<string>,
            amountOfRemainingChoices: number
        ) => {
            const choices = Object.entries(allEffects).map(([label, system]) => ({
                label,
                system,
                unavailableReason: this.getUnavailableReason(properties, choiceIds, chosenLabels, label, context)
            }));

            if (amountOfRemainingChoices === 0 || choices.every((choice) => choice.unavailableReason)) {
                return;
            }

            const effectsToChoose = this.getEffectsToChooseText(properties, amountOfRemainingChoices);
            const passOption = this.takeAbilityPassOption(player, context);

            context.game.promptWithModalEffectSelection(player, {
                title: `Choose ${effectsToChoose} for ${context.source.title}`,
                description: this.getPromptDescription(properties, player, context),
                waitingPromptTitle: `Waiting for opponent to choose ${effectsToChoose} for ${context.source.title}`,
                sourceCard: getTriggerSourceCardSummary(context.source),
                choices: choices.map(({ label, system, unavailableReason }) => ({
                    title: label,
                    hasLegalEffects: () => this.modalChoiceHasAnyLegalEffect(system, context),
                    unavailableReason,
                    handler: () => {
                        properties.choiceLimit?.increment(context, choiceIds.get(label));
                        this.pushEvent(
                            events,
                            player,
                            label,
                            system,
                            context,
                            amountOfRemainingChoices,
                            chosenLabels,
                            choiceHandler,
                            !!properties.canChooseSameOptionMoreThanOnce
                        );
                    }
                })),
                passButtonText: passOption?.buttonText
            });
        };
        choiceHandler(choosingPlayer, new Set(), properties.amountOfChoices);
    }

    // Helper method for pushing the correct event into the events array.
    private pushEvent(
        events: GameEvent[],
        choosingPlayer: Player,
        selectedPrompt: string,
        selectedSystem: GameSystem,
        context: TContext,
        amountOfRemainingChoices: number,
        chosenLabels: ReadonlySet<string>,
        choiceHandler: (player: Player, chosenLabels: ReadonlySet<string>, amountOfChoices: number) => void,
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

        // the selected choice can't be chosen again, unless the player is allowed to choose the same option again
        const nextChosenLabels = canChooseSameOptionMoreThanOnce
            ? chosenLabels
            : new Set([...chosenLabels, selectedPrompt]);
        choiceHandler(choosingPlayer, nextChosenLabels, (amountOfRemainingChoices - 1));
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

    /** The optional ability's Pass option, offered with the first choice only (see {@link GameSystem.canShowAbilityPassOption}). */
    private takeAbilityPassOption(player: Player, context: TContext): IAbilityPassOption | undefined {
        const passOption = context.abilityPassOption;
        if (!passOption || passOption.shown || passOption.player !== player) {
            return undefined;
        }

        passOption.shown = true;
        return passOption;
    }

    private getChoosingPlayer(properties: IPlayModalCardProperties, context: TContext): Player {
        return properties.choosingPlayer === RelativePlayer.Opponent
            ? context.player.opponent
            : context.player;
    }

    private getChoices(properties: IPlayModalCardProperties, context: TContext): IChoicesInterface {
        return typeof properties.choices === 'function'
            ? properties.choices(context)
            : properties.choices;
    }

    /**
     * Maps each option's label to its id for {@link IPlayModalCardProperties.choiceLimit}. Ids are positions in the
     * full list of options, so they are assigned before any option is filtered out.
     */
    private getChoiceIds(properties: IPlayModalCardProperties, choices: IChoicesInterface, context: TContext): Map<string, string> {
        const labels = Object.keys(choices);
        properties.choiceLimit?.assertStableChoiceCount(context, labels);

        return new Map(labels.map((label, index) => [label, index.toString()]));
    }

    private isChoiceWithinLimit(properties: IPlayModalCardProperties, choiceIds: Map<string, string>, label: string, context: TContext): boolean {
        return !properties.choiceLimit?.isAtMax(context, choiceIds.get(label));
    }

    /**
     * Why the option can't be chosen in the current prompt, shown as its badge, or undefined if it can be chosen.
     * Both cases use the same short text, since the badge has little room.
     */
    private getUnavailableReason(
        properties: IPlayModalCardProperties,
        choiceIds: Map<string, string>,
        chosenLabels: ReadonlySet<string>,
        label: string,
        context: TContext
    ): string | undefined {
        const chosenInThisPrompt = !properties.canChooseSameOptionMoreThanOnce && chosenLabels.has(label);
        const atChoiceLimit = !this.isChoiceWithinLimit(properties, choiceIds, label, context);

        return chosenInThisPrompt || atChoiceLimit ? 'Already chosen' : undefined;
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