import { AbilityContext } from '../core/ability/AbilityContext';
import { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import * as Contract from '../core/utils/Contract';

export interface IReplacementEffectSystemProperties extends IGameSystemProperties {
    effect?: string;

    /** Either: the immediate effect to replace the original effect with or `null` to indicate that the original effect should be cancelled with no replacement */
    replacementImmediateEffect: GameSystem | null;
}

// UP NEXT: convert this into a subclass of TriggeredAbilitySystem as TriggeredReplacementEffectSystem

export class ReplacementEffectSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends GameSystem<TContext, IReplacementEffectSystemProperties> {
    public override eventHandler(event, additionalProperties = {}): void {
        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(event.context, additionalProperties);

        if (replacementGameAction) {
            const eventWindow = event.context.event.window;
            const events = [];
            replacementGameAction.queueGenerateEventGameSteps(
                events,
                event.context,
                Object.assign({ replacementEffect: true }, additionalProperties)
            );
            event.context.game.queueSimpleStep(() => {
                if (events.length === 1) {
                    event.context.event.replacementEvent = events[0];
                }
                for (const newEvent of events) {
                    eventWindow.addEvent(newEvent);
                }
            }, 'replacementEffect: replace window event');
        }

        event.context.cancel();
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}) {
        const event = this.createEvent(null, context, additionalProperties);

        super.addPropertiesToEvent(event, null, context, additionalProperties);
        event.replaceHandler((event) => this.eventHandler(event, additionalProperties));

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

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}): IReplacementEffectSystemProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IReplacementEffectSystemProperties;
        if (properties.replacementImmediateEffect) {
            properties.replacementImmediateEffect.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        Contract.assertNotNullLike(context.event);

        if (context.event.cancelled) {
            return false;
        }

        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);

        return (
            (!replacementGameAction || replacementGameAction.hasLegalTarget(context, additionalProperties))
        );
    }

    public override canAffect(target: any, context: TContext, additionalProperties = {}): boolean {
        const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context, additionalProperties);
        return (
            (!context.event.cannotBeCancelled && !replacementGameAction) ||
            replacementGameAction.canAffect(target, context, additionalProperties)
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
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}