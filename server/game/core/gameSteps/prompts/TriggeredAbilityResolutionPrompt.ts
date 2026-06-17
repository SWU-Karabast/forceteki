import type { Player } from '../../Player';
import type { Game } from '../../Game';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import { PromptType, type ITriggerWindowButton, type ITriggerWindowSourceCard } from '../PromptInterfaces';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { UiPrompt } from './UiPrompt';

export class TriggeredAbilityResolutionPrompt extends UiPrompt {
    private readonly source = new OngoingEffectSource(this.game, 'Choose Triggered Ability Resolution Order');

    public constructor(
        game: Game,
        private readonly player: Player,
        private readonly triggeredAbilities: TriggeredAbilityContext[],
        private readonly getChoiceTitle: (context: TriggeredAbilityContext) => string,
        private readonly resolveAbility: (context: TriggeredAbilityContext) => void
    ) {
        super(game);
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        const buttons: ITriggerWindowButton[] = this.triggeredAbilities.map((context, index) => {
            const button: ITriggerWindowButton = {
                text: this.getChoiceTitle(context),
                arg: index.toString()
            };

            const sourceCard = this.getSourceCard(context);
            if (sourceCard) {
                button.sourceCard = sourceCard;
            }

            return button;
        });

        if (this.game.manualMode) {
            buttons.push({
                text: 'Cancel Prompt',
                arg: 'cancel'
            });
        }

        return {
            menuTitle: 'You have multiple triggers to resolve. Choose which to resolve first:',
            buttons,
            promptTitle: this.source.name,
            promptUuid: this.uuid,
            promptType: PromptType.TriggerWindow
        };
    }

    private getSourceCard(context: TriggeredAbilityContext): ITriggerWindowSourceCard | undefined {
        if (!context.source?.isCard?.()) {
            return undefined;
        }

        const sourceCardSummary = context.source.getShortSummary();

        return {
            ...sourceCardSummary,
            setId: context.source.setId,
            type: context.source.type
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

        const selectedIndex = Number(arg);
        const triggeredAbility = this.triggeredAbilities[selectedIndex];

        if (!triggeredAbility) {
            return false;
        }

        this.resolveAbility(triggeredAbility);
        this.complete();
        return true;
    }
}
