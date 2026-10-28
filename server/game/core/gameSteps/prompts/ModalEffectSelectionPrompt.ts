import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { EventName } from '../../Constants';
import { PromptType } from '../PromptInterfaces';
import type { IModalEffectSelectionButton, ITriggerWindowSourceCard } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

/** A single selectable option in the {@link ModalEffectSelectionPrompt}. */
export interface IModalEffectSelectionChoice {
    title: string;

    /** Evaluated each time the prompt is rendered so that it reflects the game state when the choice is made. */
    hasLegalEffects: () => boolean;

    handler: () => void;
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
            buttons: this.properties.choices.map((choice, index) => this.makeChoiceButton(choice, index)),
            promptTitle: this.properties.sourceCard.name,
            promptUuid: this.uuid,
            promptType: PromptType.ModalEffectSelection
        };
    }

    private makeChoiceButton(choice: IModalEffectSelectionChoice, index: number): IModalEffectSelectionButton {
        const hasLegalEffects = choice.hasLegalEffects();

        // Keep the "(No effect)" prefix for tests so it's easy to tell which options have no effect
        const noEffectPrefix = process.env.NODE_ENV === 'test' && !hasLegalEffects ? '(No effect) ' : '';

        return {
            text: `${noEffectPrefix}${choice.title}`,
            arg: index.toString(),
            sourceCard: this.properties.sourceCard,
            hasLegalEffects
        };
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return {
            menuTitle: this.properties.waitingPromptTitle ?? 'Waiting for opponent',
            promptUuid: this.uuid
        };
    }

    public override menuCommand(_player: Player, arg: string): boolean {
        const choice = this.properties.choices[Number(arg)];
        if (!choice) {
            return false;
        }

        // Surface the pick for the SWU-PGN recorder (pure-log; does not affect gameplay), as
        // HandlerMenuPrompt does: one MODAL_CHOICE per mode, over the modes this prompt offered.
        this.game.emit(EventName.OnModalChoice, {
            player: this.player,
            offered: this.properties.choices.map((c) => c.title),
            chose: Number(arg),
        });
        choice.handler();
        this.complete();
        return true;
    }
}
