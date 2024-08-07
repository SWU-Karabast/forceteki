import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { isArena, isAttackableLocation } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount?: number;
    isCombatDamage?: boolean;
}

export class DamageSystem extends CardTargetSystem<IDamageProperties> {
    override name = 'damage';
    override eventName = EventName.OnDamageDealt;
    override targetType = [CardType.Unit, CardType.Base];

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target, isCombatDamage } = this.generatePropertiesFromContext(context) as IDamageProperties;

        if (isCombatDamage) {
            return ['deal {1} combat damage to {0}', [amount, target]];
        } else {
            return ['deal {1} damage to {0}', [amount, target]];
        }
    }

    override canAffect(card: Card, context: AbilityContext): boolean {
        if (!isAttackableLocation(card.location)) {
            return false;
        }
        if (!card.checkRestrictions('receiveDamage', context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { amount, isCombatDamage } = this.generatePropertiesFromContext(context, additionalProperties) as IDamageProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.damage = amount;
        event.isCombatDamage = isCombatDamage;
        event.context = context;
        event.recipient = card;
    }

    eventHandler(event): void {
        event.card.addDamage(event.damage);
    }
}
