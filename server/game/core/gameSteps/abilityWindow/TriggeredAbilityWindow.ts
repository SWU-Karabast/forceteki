import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import { AbilityType } from '../../Constants';
import type { EventWindow } from '../../event/EventWindow';
import type Game from '../../Game';
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

    protected resolveAbility(context: TriggeredAbilityContext) {
        const resolver = this.game.resolveAbility(context, ['player']);
        this.game.queueSimpleStep(() => {
            if (resolver.resolutionCommitted) {
                this.postResolutionUpdate(resolver);
            }
        }, `Check resolution of triggered ability ${resolver.context.ability}`);
    }

    /**
     * Check if an ability was triggered by an event with a specific name through this window.
     * This is used by cards like ShadowCaster to determine if an ability was naturally triggered
     * vs manually activated by systems like UseWhenDefeatedSystem.
     */
    public wasAbilityTriggeredByEventType(ability: TriggeredAbility, eventName: string): boolean {
        const events = this.triggeredAbilityEvents.get(ability);
        return events?.some((event) => event.name === eventName) || false;
    }

    public override toString() {
        const windowName = this.triggerAbilityType === AbilityType.Triggered ? 'TriggeredAbilityWindow' : 'DelayedEffectWindow';
        return `'${windowName}: ${this.triggeringEvents.map((event) => event.name).join(', ')}'`;
    }
}
