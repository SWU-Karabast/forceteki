import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { AbilityRestriction, CardType, EventName } from '../core/Constants';
import { isArena, isAttackableLocation } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';

export interface IHealProperties extends ICardTargetSystemProperties {
    amount: number;
}

export class HealSystem extends CardTargetSystem<IHealProperties> {
    public override readonly name = 'heal';
    public override readonly eventName = EventName.OnDamageRemoved;
    protected override readonly targetType = [CardType.Unit, CardType.Base];

    public eventHandler(event): void {
        event.card.removeDamage(event.healAmount);
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target } = this.generatePropertiesFromContext(context);

        return ['heal {1} damage from {0}', [amount, target]];
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!isAttackableLocation(card.location)) {
            return false;
        }
        if (properties.isCost && (properties.amount === 0 || card.hp === 0 || card.hp === null)) {
            return false;
        }
        if (card.hasRestriction(AbilityRestriction.BeHealed, context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.healAmount = amount;
        event.context = context;
        event.recipient = card;
    }
}
