import { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import Contract from '../core/utils/Contract';

export interface ICancelActionProperties extends IGameSystemProperties {
    replacementGameAction?: GameSystem;
    effect?: string;
}

// UP NEXT: convert this into a subclass of TriggeredAbilitySystem as TriggeredReplacementEffectSystem

export class ModifyEventResolutionSystem extends GameSystem {
    public override eventHandler(event, additionalProperties = {}): void {
        const { replacementGameAction } = this.generatePropertiesFromContext(event.context, additionalProperties);

        if (replacementGameAction) {
            const eventWindow = event.context.event.window;
            const events = replacementGameAction.generateEventsForAllTargets(
                event.context,
                Object.assign({ replacementEffect: true }, additionalProperties)
            );
            event.context.game.queueSimpleStep(() => {
                if (!event.context.event.isSacrifice && events.length === 1) {
                    event.context.event.replacementEvent = events[0];
                }
                for (const newEvent of events) {
                    eventWindow.addEvent(newEvent);
                }
            });
        }

        event.context.cancel();
    }

    public override generateEventsForAllTargets(context: TriggeredAbilityContext, additionalProperties = {}) {
        const event = this.createEvent(null, context, additionalProperties);

        super.addPropertiesToEvent(event, null, context, additionalProperties);
        event.replaceHandler((event) => this.eventHandler(event, additionalProperties));

        return [event];
    }

    public override getEffectMessage(context: TriggeredAbilityContext): [string, any[]] {
        const { replacementGameAction, effect } = this.generatePropertiesFromContext(context);
        if (effect) {
            return [effect, []];
        }
        if (replacementGameAction) {
            return ['{1} {0} instead of {2}', [context.target, replacementGameAction.name, context.event.card]];
        }
        return ['cancel the effects of {0}', [context.event.card]];
    }

    public override generatePropertiesFromContext(context: TriggeredAbilityContext, additionalProperties = {}): ICancelActionProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as ICancelActionProperties;
        if (properties.replacementGameAction) {
            properties.replacementGameAction.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override hasLegalTarget(context: TriggeredAbilityContext, additionalProperties = {}): boolean {
        if (!Contract.assertNotNullLike(context.event)) {
            return false;
        }

        if (context.event.cancelled) {
            return false;
        }

        const { replacementGameAction } = this.generatePropertiesFromContext(context);

        return (
            (!replacementGameAction || replacementGameAction.hasLegalTarget(context, additionalProperties))
        );
    }

    public override canAffect(target: any, context: TriggeredAbilityContext, additionalProperties = {}): boolean {
        const { replacementGameAction } = this.generatePropertiesFromContext(context, additionalProperties);
        return (
            (!context.event.cannotBeCancelled && !replacementGameAction) ||
            replacementGameAction.canAffect(target, context, additionalProperties)
        );
    }

    public override defaultTargets(context: TriggeredAbilityContext): any[] {
        return context.event.card ? [context.event.card] : [];
    }

    public override hasTargetsChosenByInitiatingPlayer(context: TriggeredAbilityContext, additionalProperties = {}): boolean {
        const { replacementGameAction } = this.generatePropertiesFromContext(context);
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