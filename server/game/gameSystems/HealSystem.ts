import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { isArena, isAttackableLocation } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';

export interface IHealProperties extends ICardTargetSystemProperties {
    amount: number;
}

export class HealSystem extends CardTargetSystem<IHealProperties> {
    override name = 'heal';
    override eventName = EventName.OnDamageRemoved;
    override targetType = [CardType.Unit, CardType.Base];

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target } = this.generatePropertiesFromContext(context);

        return ['heal {1} damage from {0}', [amount, target]];
    }

    override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!isAttackableLocation(card.location)) {
            return false;
        }
        if (properties.isCost && (properties.amount === 0 || card.hp === 0 || card.hp === null)) {
            return false;
        }
        // UP NEXT: rename 'checkRestrictions' to 'hasRestriction' and invert the logic
        {
            if (!card.checkRestrictions('beHealed', context)) {
                return false;
            }
        }
        return super.canAffect(card, context);
    }

    override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.healAmount = amount;
        event.context = context;
        event.recipient = card;
    }

    eventHandler(event): void {
        event.card.removeDamage(event.healAmount);
    }
}
