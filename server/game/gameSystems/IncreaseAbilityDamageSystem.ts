import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import { Contract } from '../core/utils/Contract';

export interface IIncreaseAbilityDamageSystemProperties extends IGameSystemProperties {
    amount: number;
}

/**
 * Used by damage modification effects that apply when an ability is initiated rather than to
 * individual damage events (e.g. Ty Yorrick, Monster Hunter). Marks the triggering ability's
 * context with a pending damage increase which is consumed by damage-generating systems when
 * they create their damage events (per damage event, or on the total amount before distribution
 * for indirect and distribute-damage effects).
 */
export class IncreaseAbilityDamageSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends GameSystem<TContext, IIncreaseAbilityDamageSystemProperties> {
    public override readonly eventName = MetaEventName.IncreaseAbilityDamage;
    public override readonly name = 'increaseAbilityDamage';
    public override readonly effectDescription = 'increase ability damage';

    public override eventHandler(event: GameEvent, additionalProperties: Partial<IIncreaseAbilityDamageSystemProperties> = {}): void {
        const context = event.context as TContext;
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const abilityContext = context.event?.context;

        Contract.assertNotNullLike(abilityContext, 'Attempting to increase ability damage outside of a triggered event');

        abilityContext.pendingAbilityDamageIncrease = (abilityContext.pendingAbilityDamageIncrease ?? 0) + properties.amount;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IIncreaseAbilityDamageSystemProperties> = {}) {
        const event = this.createEvent(null, context, additionalProperties);

        this.addPropertiesToEvent(event, null, context, additionalProperties);
        event.setHandler((e) => this.eventHandler(e, additionalProperties));

        events.push(event);
    }

    public override hasLegalTarget(context: TContext): boolean {
        return context.event?.canResolve ?? false;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['increase damage by {0}', [properties.amount]];
    }

    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }
}
