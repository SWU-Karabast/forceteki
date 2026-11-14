import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { PromptType } from '../PromptInterfaces';
import type { IButton, IModalEffectSelectionButton, ITriggerWindowSourceCard } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

/** A single selectable option in the {@link ModalEffectSelectionPrompt}. */
export interface IModalEffectSelectionChoice {
    title: string;

    /** Evaluated each time the prompt is rendered so that it reflects the game state when the choice is made. */
    hasLegalEffects: () => boolean;

    handler: () => void;

    /**
     * Set when the option is shown but can't be chosen, e.g. "Already chosen". The option is rendered as a disabled
     * button with this text as its badge, and clicks on it are rejected.
     */
    unavailableReason?: string;
}

export interface IModalEffectSelectionPromptProperties {

    /** Prompt header, e.g. "Choose 2 effects for Cunning". */
    title: string;

    /** Secondary text shown beneath the title, e.g. whether options can be chosen more than once. */
    description?: string;

    /** Header shown to the player who isn't choosing. Defaults to "Waiting for opponent". */
    waitingPromptTitle?: string;

    /** Card with the modal ability, rendered as every option's button. */
    sourceCard: ITriggerWindowSourceCard;

    choices: IModalEffectSelectionChoice[];

    /** Present when the player may choose none of the options; rendered as a plain button after the options. */
    passButtonText?: string;
}

/**
 * The prompt shown when resolving a modal ability ("Choose two: ..."). Renders each option as a card button
 * showing the ability's source card, in the order the options are printed on the card.
 */
export class ModalEffectSelectionPrompt extends UiPrompt {
    private readonly player: Player;
    private readonly properties: IModalEffectSelectionPromptProperties;

    public constructor(game: Game, player: Player, properties: IModalEffectSelectionPromptProperties) {
        super(game);

        this.player = player;
        this.properties = properties;
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        return {
            menuTitle: this.properties.title,
            promptDescription: this.properties.description,
            buttons: this.makeButtons(),
            promptTitle: this.properties.sourceCard.name,
            promptUuid: this.uuid,
            promptType: PromptType.ModalEffectSelection
        };
    }

    private makeButtons(): IButton[] {
        const buttons: IButton[] = this.properties.choices.map((choice, index) => this.makeChoiceButton(choice, index));

        if (this.properties.passButtonText) {
            buttons.push({ text: this.properties.passButtonText, arg: 'pass' });
        }

        return buttons;
    }

    private makeChoiceButton(choice: IModalEffectSelectionChoice, index: number): IModalEffectSelectionButton {
        const hasLegalEffects = choice.hasLegalEffects();
        const button: IModalEffectSelectionButton = {
            text: `${this.getTestPrefix(choice, hasLegalEffects)}${choice.title}`,
            arg: index.toString(),
            sourceCard: this.properties.sourceCard,
            hasLegalEffects
        };

        if (choice.unavailableReason) {
            button.disabled = true;
            button.unavailableReason = choice.unavailableReason;
        }

        return button;
    }

    /**
     * In tests, prefix the option with its badge, e.g. "(No effect) " or "(Already chosen) ", so specs can tell the
     * options apart by text. An unavailable option shows only its unavailable reason, as the client does.
     */
    private getTestPrefix(choice: IModalEffectSelectionChoice, hasLegalEffects: boolean): string {
        if (process.env.NODE_ENV !== 'test') {
            return '';
        }

        if (choice.unavailableReason) {
            return `(${choice.unavailableReason}) `;
        }

        return hasLegalEffects ? '' : '(No effect) ';
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return {
            menuTitle: this.properties.waitingPromptTitle ?? 'Waiting for opponent',
            promptUuid: this.uuid
        };
    }

    public override menuCommand(_player: Player, arg: string): boolean {
        if (arg === 'pass' && this.properties.passButtonText) {
            this.complete();
            return true;
        }

        const choice = this.properties.choices[Number(arg)];
        if (!choice || choice.unavailableReason) {
            return false;
        }

        choice.handler();
        this.complete();
        return true;
    }
}
