import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import type { FormatMessage } from '../core/chat/GameChat';
import { AbilityType, GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import { Contract } from '../core/utils/Contract';
import { ChatHelpers } from '../core/chat/ChatHelpers';

export interface IReplacementEffectSystemProperties<TContext extends TriggeredAbilityContext> extends IGameSystemProperties {
    effect?: string;

    /** The immediate effect to replace the original effect with or `null` to indicate that the original effect should be cancelled with no replacement */
    replacementImmediateEffect?: GameSystem<TContext>;
}

export class ReplacementEffectSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext, TProperties extends IReplacementEffectSystemProperties<TContext> = IReplacementEffectSystemProperties<TContext>> extends GameSystem<TContext, TProperties> {
    public override readonly eventName = MetaEventName.ReplacementEffect;

    protected override eventHandlerInternal(event, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        const triggerWindow = event.context.replacementEffectWindow;

        Contract.assertNotNullLike(triggerWindow, `Replacement effect '${this} resolving outside of any trigger window`);
        Contract.assertTrue(
            triggerWindow.triggerAbilityType === AbilityType.ReplacementEffect,
            `Replacement effect '${this} resolving in trigger window of type ${triggerWindow.triggerAbilityType}`
        );

        if (!this.shouldReplace(event.context, additionalProperties)) {
            return;
        }

        const eventBeingReplaced = event.context.event as GameEvent;
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

        if (!replacementImmediateEffect && this.nullifiedEventCountsAsResolved()) {
            eventBeingReplaced.replaceWithNoEffect();
        } else {
            eventBeingReplaced.cancel();
        }
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}) {
        const event = this.createEvent(null, context, properties, additionalProperties);

        this.addPropertiesToEvent(event, null, context, properties, additionalProperties);
        event.setHandler((event) => this.eventHandler(event, additionalProperties));

        events.push(event);
    }

    protected override getEffectMessageInternal(context: TContext, properties: TProperties): [string, any[]] {
        const { replacementImmediateEffect, effect } = properties;

        const effectMessage = (): FormatMessage => {
            if (effect) {
                return {
                    format: effect,
                    args: []
                };
            }

            if (replacementImmediateEffect) {
                return {
                    format: '{0} instead of {1}',
                    args: [replacementImmediateEffect.getEffectMessage(context), this.getTargetMessage(context.event.card, context)]
                };
            }

            return {
                format: 'cancel the effects of {0}',
                args: [this.getTargetMessage(context.event.context.source, context)]
            };
        };

        return [ChatHelpers.formatWithLength(1, 'to '), [effectMessage()]];
    }

    protected override prepareProperties(context: TContext, properties: TProperties): void {
        super.prepareProperties(context, properties);

        if (properties.replacementImmediateEffect) {
            properties.replacementImmediateEffect.setDefaultTargetFn(() => properties.target);
        }
    }

    protected override addPropertiesToEvent(event: any, target: any, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        super.addPropertiesToEvent(event, target, context, properties, additionalProperties);

        event.replacementImmediateEffect = this.getReplacementImmediateEffect(event.context, additionalProperties);
    }

    protected getReplacementImmediateEffect(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): GameSystem<TContext> {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.replacementImmediateEffect;
    }

    protected shouldReplace (context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        return true;
    }

    /**
     * Whether an event nullified by this effect (no replacement event) still counts as resolved for
     * "if you do" (CR 8.9). False by default: non-damage no-op replacements model "can't" effects.
     */
    protected nullifiedEventCountsAsResolved(): boolean {
        return false;
    }

    protected override hasLegalTargetInternal(context: TContext, properties: TProperties, _mustChangeGameState, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        Contract.assertNotNullLike(context.event);

        if (!context.event.canResolve) {
            return false;
        }

        const replacementGameAction = this.getReplacementImmediateEffect(context, additionalProperties);

        return (
            (!replacementGameAction || replacementGameAction.hasLegalTarget(context, additionalProperties, GameStateChangeRequired.None))
        );
    }

    public override defaultTargets(context: TContext): any[] {
        return context.event.card ? [context.event.card] : [];
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const { replacementImmediateEffect: replacementGameAction } = properties;
        return (
            replacementGameAction &&
            replacementGameAction.hasTargetsChosenByPlayer(context, player, additionalProperties)
        );
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }

    protected override canAffectInternal(target: GameObject, context: TContext, properties: TProperties): boolean {
        return this.isTargetTypeValid(target);
    }
}