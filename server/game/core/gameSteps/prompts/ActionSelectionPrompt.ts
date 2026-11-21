import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { PromptType } from '../PromptInterfaces';
import type { IActionSelectionButton, IButton, ITriggerWindowSourceCard } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

/** A single selectable action in the {@link ActionSelectionPrompt}. */
export interface IActionSelectionChoice {
    title: string;

    /** Card rendered as the action's button: the card granting the action if it was gained, otherwise the clicked card. */
    sourceCard: ITriggerWindowSourceCard;

    hasLegalEffects: boolean;

    /** True when the action was gained from another card, i.e. {@link sourceCard} is not the clicked card. */
    gained: boolean;

    handler: () => void;
}

export interface IActionSelectionPromptProperties {

    /** Prompt header, e.g. "Choose an action for Kazuda Xiono". */
    title: string;

    /** Name of the clicked card. */
    sourceCardName: string;

    choices: IActionSelectionChoice[];
}

/**
 * The "Choose an action" prompt shown when a player clicks a card with multiple available actions (or a single
 * action that requires confirmation, such as deploying a leader). Renders each action as a card button alongside
 * a Cancel button.
 */
export class ActionSelectionPrompt extends UiPrompt {
    private readonly player: Player;
    private readonly properties: IActionSelectionPromptProperties;
    private readonly choices: IActionSelectionChoice[];

    public constructor(game: Game, player: Player, properties: IActionSelectionPromptProperties) {
        super(game);

        this.player = player;
        this.properties = properties;

        // sort so that choices that can actually do something are presented first
        this.choices = [...properties.choices].sort((a, b) => Number(b.hasLegalEffects) - Number(a.hasLegalEffects));
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        const buttons: (IActionSelectionButton | IButton)[] = this.choices.map((choice, index) => this.makeChoiceButton(choice, index));
        buttons.push({ text: 'Cancel', arg: 'cancel' });

        return {
            menuTitle: this.properties.title,
            buttons,
            promptTitle: this.properties.sourceCardName,
            promptUuid: this.uuid,
            promptType: PromptType.ActionSelection
        };
    }

    private makeChoiceButton(choice: IActionSelectionChoice, index: number): IActionSelectionButton {
        // Keep the "(No effect)" prefix for tests so it's easy to tell which actions have no effect
        const noEffectPrefix = process.env.NODE_ENV === 'test' && !choice.hasLegalEffects ? '(No effect) ' : '';

        return {
            text: `${noEffectPrefix}${choice.title}`,
            arg: index.toString(),
            sourceCard: choice.sourceCard,
            hasLegalEffects: choice.hasLegalEffects,
            gained: choice.gained
        };
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Waiting for opponent',
            promptUuid: this.uuid
        };
    }

    public override menuCommand(_player: Player, arg: string): boolean {
        if (arg === 'cancel') {
            this.complete();
            return true;
        }

        const choice = this.choices[Number(arg)];
        if (!choice) {
            return false;
        }

        choice.handler();
        this.complete();
        return true;
    }
}
