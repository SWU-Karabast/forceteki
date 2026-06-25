import type { Player } from '../../Player';
import type { Game } from '../../Game';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import { PromptType, type ITriggerWindowButton, type ITriggerWindowSourceCard } from '../PromptInterfaces';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { UiPrompt } from './UiPrompt';
import { SubStepCheck } from '../../Constants';

export class TriggeredAbilityResolutionPrompt extends UiPrompt {
    private readonly source = new OngoingEffectSource(this.game, 'Choose Triggered Ability Resolution Order');
    private readonly player: Player;
    private readonly triggeredAbilities: TriggeredAbilityContext[];
    private readonly resolveAbility: (context: TriggeredAbilityContext) => void;

    public constructor(
        game: Game,
        player: Player,
        triggeredAbilities: TriggeredAbilityContext[],
        resolveAbility: (context: TriggeredAbilityContext) => void
    ) {
        super(game);

        this.player = player;
        this.resolveAbility = resolveAbility;

        const sortedAbilities = triggeredAbilities
            .map((context) => {
                const hasLegalEffects = context.ability.hasAnyLegalEffects(context, SubStepCheck.All);
                return { context, hasLegalEffects };
            })
            .sort((a, b) => {
                if (a.hasLegalEffects && !b.hasLegalEffects) {
                    return -1;
                } else if (!a.hasLegalEffects && b.hasLegalEffects) {
                    return 1;
                }
                return 0;
            });

        this.triggeredAbilities = sortedAbilities.map((item) => item.context);
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        const buttons = this.triggeredAbilities
            .map((context, index) => this.makeChoiceButton(context, index));

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

        return {
            ...context.source.getShortSummary(),
            type: context.source.type
        };
    }

    private makeChoiceButton(context: TriggeredAbilityContext, num: number): ITriggerWindowButton {
        const hasLegalEffects = context.ability.hasAnyLegalEffects(context, SubStepCheck.All);

        // Keep the "(No effect)" prefix for tests so it's easy to tell which abilities have no effect
        const noEffectPrefix = process.env.NODE_ENV === 'test' && !hasLegalEffects ? '(No effect) ' : '';
        const title = `${noEffectPrefix}${context.ability.getTitle(context)}`;

        return {
            text: title,
            arg: num.toString(),
            sourceCard: this.getSourceCard(context),
            hasLegalEffects
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
