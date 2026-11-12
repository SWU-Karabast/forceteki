import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import { AbilityType, RelativePlayer } from '../../Constants';
import type { EventWindow } from '../../event/EventWindow';
import type { Game } from '../../Game';
import { PreResolvedOptionalChoice } from '../AbilityResolver';
import type { IResolutionChoice } from '../PromptInterfaces';
import { TriggerWindowBase } from './TriggerWindowBase';

export class TriggeredAbilityWindow extends TriggerWindowBase {
    public constructor(
        game: Game,
        triggerAbilityType: AbilityType.Triggered | AbilityType.DelayedEffect,
        eventWindow?: EventWindow
    ) {
        super(game, triggerAbilityType, eventWindow);
    }

    public override shouldCleanUpTriggers(): boolean {
        return !this.choosePlayerResolutionOrderComplete;
    }

    public override addTriggeredAbilityToWindow(context: TriggeredAbilityContext) {
        // new triggers can't be added to a regular triggered ability window once it's started resolving, they all should have happened during event resolution
        this.assertWindowResolutionNotStarted('ability', context.source);

        super.addTriggeredAbilityToWindow(context);
    }

    protected resolveAbility(context: TriggeredAbilityContext, preResolvedOptional?: PreResolvedOptionalChoice) {
        // Triggered abilities can't be cancelled once they resolve (an optional one is declined via its
        // "Pass" button), so suppress the spurious "Cancel" button that a top-level resolver would show.
        const resolver = this.game.resolveAbility(context, ['player'], false, preResolvedOptional);
        this.game.queueSimpleStep(() => {
            if (resolver.resolutionCommitted) {
                this.postResolutionUpdate(resolver);
            }
        }, `Check resolution of triggered ability ${resolver.context.ability}`);
    }

    /**
     * An optional ("may") trigger gets its Trigger/Pass decision inline in the resolution-order prompt, skipping
     * the interstitial "You may trigger this ability" prompt. When the opponent is the chooser
     * (`playerChoosingOptional`), the choice is left without inline handlers and falls back to the interstitial.
     */
    protected override buildContextChoice(context: TriggeredAbilityContext): IResolutionChoice {
        const choice = super.buildContextChoice(context);

        const chooser = context.ability.playerChoosingOptional ?? RelativePlayer.Self;
        if (!context.ability.optional || chooser !== RelativePlayer.Self) {
            return choice;
        }

        return {
            ...choice,
            optional: {
                onTrigger: () => this.resolveAbility(context, PreResolvedOptionalChoice.Trigger),
                onPass: () => this.resolveAbility(context, PreResolvedOptionalChoice.Pass),
                passButtonText: context.ability.optionalButtonTextOverride ??
                  (context.ability.isAttackAction() ? 'Pass attack' : 'Pass'),
            },
        };
    }

    public override toString() {
        const windowName = this.triggerAbilityType === AbilityType.Triggered ? 'TriggeredAbilityWindow' : 'DelayedEffectWindow';
        return `'${windowName}: ${this.triggeringEvents.map((event) => event.name).join(', ')}'`;
    }
}
