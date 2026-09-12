import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { PromptType } from '../PromptInterfaces';
import type { IButtonWithSourceCard, ITriggerWindowSourceCard } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

export interface IOptionalTriggerPromptProperties {

    /** Card summary rendered as the Trigger button; omitted only if the ability has no card source. */
    sourceCard?: ITriggerWindowSourceCard;

    /** The ability's text, rendered as the Trigger button's label. */
    abilityText: string;

    /** Text of the decline button; defaults to 'Pass'. */
    passButtonText?: string;

    onTrigger: () => void;
    onPass: () => void;
}

/**
 * The "You may trigger this ability" prompt for a single optional triggered ability. Renders the ability's
 * source card as the Trigger button (with the ability text as its label) alongside a Pass button, letting
 * the player resolve or decline the ability.
 */
export class OptionalTriggerPrompt extends UiPrompt {
    private readonly player: Player;
    private readonly properties: IOptionalTriggerPromptProperties;

    public constructor(game: Game, player: Player, properties: IOptionalTriggerPromptProperties) {
        super(game);

        this.player = player;
        this.properties = properties;
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        const { sourceCard, abilityText, passButtonText } = this.properties;

        const triggerButton: IButtonWithSourceCard = {
            text: 'Trigger',
            arg: 'trigger',
            sourceCard,
            label: abilityText
        };

        return {
            menuTitle: 'You may trigger this ability',
            buttons: [
                triggerButton,
                { text: passButtonText ?? 'Pass', arg: 'pass' }
            ],
            // Not shown by this popup (its header is menuTitle); the client only reads promptTitle's
            // truthiness to tint the board prompt banner as "card-sourced". Reuse the summary's title.
            promptTitle: sourceCard?.name,
            promptUuid: this.uuid,
            promptType: PromptType.OptionalTrigger
        };
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Waiting for opponent',
            promptUuid: this.uuid
        };
    }

    public override menuCommand(_player: Player, arg: string): boolean {
        switch (arg) {
            case 'trigger':
                this.properties.onTrigger();
                this.complete();
                return true;
            case 'pass':
                this.properties.onPass();
                this.complete();
                return true;
            default:
                return false;
        }
    }
}
