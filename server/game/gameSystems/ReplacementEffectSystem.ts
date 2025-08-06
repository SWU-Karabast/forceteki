import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { AbilityType, GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';

export interface IReplacementEffectSystemProperties<TContext extends TriggeredAbilityContext> extends IGameSystemProperties {
    effect?: string;

    /** The immediate effect to replace the original effect with or `null` to indicate that the original effect should be cancelled with no replacement */
    replacementImmediateEffect?: GameSystem<TContext>;
}

export class ReplacementEffectSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends GameSystem<TContext, IReplacementEffectSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.ReplacementEffect;

    public override eventHandler(event, additionalProperties: Partial<IReplacementEffectSystemProperties<TContext>> = {}): void {
        const triggerWindow = event.context.replacementEffectWindow;

        Contract.assertNotNullLike(triggerWindow, `Replacement effect '${this} resolving outside of any trigger window`);
        Contract.assertTrue(
            triggerWindow.triggerAbilityType === AbilityType.ReplacementEffect,
            `Replacement effect '${this} resolving in trigger window of type ${triggerWindow.triggerAbilityType}`
        );

        const eventBeingReplaced = event.context.event;

        const replacementImmediateEffect = event.replacementImmediateEffect;
        if (replacementImmediateEffect) {
            const eventWindow = eventBeingReplaced.window;
            const events = [];

            replacementImmediateEffect.queueGenerateEventGameSteps(
                events,
                event.context,
                { ...additionalProperties, replacementEffect: true }
            );

            event.context.game.queueSimpleStep(() => {
                Contract.assertFalse(events.length === 0, `Replacement effect ${replacementImmediateEffect} for ${event.name} did not generate any events`);

                events.forEach((replacementEvent) => {
                    replacementEvent.order = eventBeingReplaced.order;
                    event.context.game.queueSimpleStep(() => {
                        eventBeingReplaced.setReplacementEvent(replacementEvent);
                        eventWindow.addEvent(replacementEvent);
                        triggerWindow.addReplacementEffectEvent(replacementEvent);
                    }, 'replacementEffect: replace window event');
                });
            }, 'replacementEffect: add replacement event to window');
        }

        event.context.cancel();
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IReplacementEffectSystemProperties<TContext>> = {}) {
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
            return ['{0} instead of {1}', [replacementImmediateEffect.getEffectMessage(context), this.getTargetMessage(context.event.card, context)]];
        }
        return ['cancel the effects of {0}', [this.getTargetMessage(context.event.card, context)]];
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IReplacementEffectSystemProperties<TContext>> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (properties.replacementImmediateEffect) {
            properties.replacementImmediateEffect.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override addPropertiesToEvent(event: any, target: any, context: TContext, additionalProperties?: Partial<IReplacementEffectSystemProperties<TContext>>): void {
        super.addPropertiesToEvent(event, target, context, additionalProperties);

        const { replacementImmediateEffect } = this.generatePropertiesFromContext(event.context, additionalProperties);
        event.replacementImmediateEffect = replacementImmediateEffect;
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IReplacementEffectSystemProperties<TContext>> = {}, _mustChangeGameState): boolean {
        Contract.assertNotNullLike(context.event);

        if (!context.event.canResolve) {
            return false;
        }

        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);

        return (
            (!replacementGameAction || replacementGameAction.hasLegalTarget(context, additionalProperties, GameStateChangeRequired.None))
        );
    }

    public override defaultTargets(context: TContext): any[] {
        return context.event.card ? [context.event.card] : [];
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IReplacementEffectSystemProperties<TContext>> = {}): boolean {
        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);
        return (
            replacementGameAction &&
            replacementGameAction.hasTargetsChosenByPlayer(context, player, additionalProperties)
        );
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }

    protected override canAffectInternal(target: GameObject, context: TContext, additionalProperties: Partial<IReplacementEffectSystemProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.isTargetTypeValid(target);
    }
}