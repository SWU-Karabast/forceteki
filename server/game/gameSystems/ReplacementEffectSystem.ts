import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { AbilityType, GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import * as Contract from '../core/utils/Contract';

export interface IReplacementEffectSystemProperties<TContext extends TriggeredAbilityContext> extends IGameSystemProperties {
    effect?: string;

    /** The immediate effect to replace the original effect with or `null` to indicate that the original effect should be cancelled with no replacement */
    replacementImmediateEffect?: GameSystem<TContext>;
}

// UP NEXT: convert this into a subclass of TriggeredAbilitySystem as TriggeredReplacementEffectSystem

export class ReplacementEffectSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends GameSystem<TContext, IReplacementEffectSystemProperties<TContext>> {
    protected override readonly eventName = MetaEventName.ReplacementEffect;

    public override eventHandler(event, additionalProperties = {}): void {
        const triggerWindow = event.context.replacementEffectWindow;

        Contract.assertNotNullLike(triggerWindow, `Replacement effect '${this} resolving outside of any trigger window`);
        Contract.assertTrue(
            triggerWindow.triggerAbilityType === AbilityType.ReplacementEffect,
            `Replacement effect '${this} resolving in trigger window of type ${triggerWindow.triggerAbilityType}`
        );

        const replacementImmediateEffect = event.replacementImmediateEffect;
        if (replacementImmediateEffect) {
            const eventWindow = event.context.event.window;
            const events = [];

            replacementImmediateEffect.queueGenerateEventGameSteps(
                events,
                event.context,
                { ...additionalProperties, replacementEffect: true }
            );

            Contract.assertFalse(events.length === 0, `Replacement effect ${replacementImmediateEffect} for ${event.name} did not generate any events`);

            events.forEach((replacementEvent) => {
                event.context.game.queueSimpleStep(() => {
                    event.context.event.setReplacementEvent(replacementEvent);
                    eventWindow.addEvent(replacementEvent);
                    triggerWindow.addReplacementEffectEvent(replacementEvent);
                }, 'replacementEffect: replace window event');
                // Check if the replacement effect only partial resolved the event (ie Boba's Armor not preventing all damage)
                // This implies that there is still more of the effect that can be replaced.
                if (triggerWindow.unresolved && triggerWindow.unresolved.size > 0 &&
                  replacementEvent?.context?.ability?.properties?.isPartial &&
                  replacementEvent.context.ability.properties.isPartial(replacementEvent.context)) {
                    // Find any other unresolved triggers that have the same source event, are the same type of ability,
                    // and has the target as what was just used for replacement.
                    const unresolvedWithSameTriggers = [...triggerWindow.unresolved.values()]
                        .flatMap((list) => list)
                        .filter((context) => replacementEvent.context.ability.abilityIdentifier !== context.ability.abilityIdentifier &&
                          context.event.name === replacementEvent.name &&
                          context.event.context.target === replacementEvent.context.event.context.target);
                    // If we find any such a triggers, change the trigger's event from the original event to this replacement event.
                    unresolvedWithSameTriggers.forEach((trigger) => trigger.event = replacementEvent);
                }
            });
        }
        event.context.cancel();
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}) {
        const event = this.createEvent(null, context, additionalProperties);

        this.addPropertiesToEvent(event, null, context, additionalProperties);
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

    public override addPropertiesToEvent(event: any, target: any, context: TContext, additionalProperties?: any): void {
        super.addPropertiesToEvent(event, target, context, additionalProperties);

        const { replacementImmediateEffect } = this.generatePropertiesFromContext(event.context, additionalProperties);
        event.replacementImmediateEffect = replacementImmediateEffect;
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