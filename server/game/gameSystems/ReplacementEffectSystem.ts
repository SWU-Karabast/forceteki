import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import * as Contract from '../core/utils/Contract';

export interface IReplacementEffectSystemProperties<TContext extends TriggeredAbilityContext> extends IGameSystemProperties {
    effect?: string;

    /** The immediate effect to replace the original effect with or `null` to indicate that the original effect should be cancelled with no replacement */
    replacementImmediateEffect: GameSystem<TContext>;
}

// UP NEXT: convert this into a subclass of TriggeredAbilitySystem as TriggeredReplacementEffectSystem

export class ReplacementEffectSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends GameSystem<TContext, IReplacementEffectSystemProperties<TContext>> {
    protected override readonly eventName = MetaEventName.ReplacementEffect;
    public override eventHandler(event, additionalProperties = {}): void {
        const { replacementImmediateEffect } = this.generatePropertiesFromContext(event.context, additionalProperties);

        if (replacementImmediateEffect) {
            const eventWindow = event.context.event.window;
            const events = [];
            replacementImmediateEffect.queueGenerateEventGameSteps(
                events,
                event.context,
                Object.assign({ replacementEffect: true }, additionalProperties)
            );

            Contract.assertFalse(events.length === 0, `Replacement effect ${replacementImmediateEffect} for ${event.name} did not generate any events`);
            if (events.length > 1) {
                throw new Error(`Multiple replacement events is not yet supported (replacement effect ${replacementImmediateEffect} for ${event.name} generated ${events.length} events)`);
            }

            const replacementEvent = events[0];

            // TODO: refactor this to allow for "partial" replacement effects like Boba Fett's Armor or damage on draw from empty deck
            event.context.game.queueSimpleStep(() => {
                event.context.event.setReplacementEvent(replacementEvent);
                eventWindow.addEvent(replacementEvent);
            }, 'replacementEffect: replace window event');
        }

        event.context.cancel();
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}) {
        const event = this.createEvent(null, context, additionalProperties);

        super.addPropertiesToEvent(event, null, context, additionalProperties);
        event.setHandler((event) => this.eventHandler(event, additionalProperties));

        events.push(event);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { replacementImmediateEffect, effect } = this.generatePropertiesFromContext(context);
        if (effect) {
            return [effect, []];
        }
        if (replacementImmediateEffect) {
            return ['{1} {0} instead of {2}', [context.target, replacementImmediateEffect.name, context.event.card]];
        }
        return ['cancel the effects of {0}', [context.event.card]];
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (properties.replacementImmediateEffect) {
            properties.replacementImmediateEffect.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        Contract.assertNotNullLike(context.event);

        if (!context.event.canResolve) {
            return false;
        }

        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);

        return (
            (!replacementGameAction || replacementGameAction.hasLegalTarget(context, additionalProperties))
        );
    }

    public override canAffect(target: any, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context, additionalProperties);
        return (
            (!context.event.cannotBeCancelled && !replacementGameAction) ||
            replacementGameAction.canAffect(target, context, additionalProperties, mustChangeGameState)
        );
    }

    public override defaultTargets(context: TContext): any[] {
        return context.event.card ? [context.event.card] : [];
    }

    public override hasTargetsChosenByInitiatingPlayer(context: TContext, additionalProperties = {}): boolean {
        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);
        return (
            replacementGameAction &&
            replacementGameAction.hasTargetsChosenByInitiatingPlayer(context, additionalProperties)
        );
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }
}