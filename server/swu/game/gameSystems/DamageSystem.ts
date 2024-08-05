import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardTypes, EventNames, isArena, isAttackableLocation } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount?: number;
    isCombatDamage?: boolean;
}

export class DamageSystem extends CardTargetSystem<IDamageProperties> {
    name = 'damage';
    eventName = EventNames.OnDamageDealt;
    targetType = [CardTypes.Unit, CardTypes.Base];

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target, isCombatDamage } = this.getProperties(context) as IDamageProperties;

        if (isCombatDamage) {
            return ['deal {1} combat damage to {0}', [amount, target]];
        } else {
            return ['deal {1} damage to {0}', [amount, target]];
        }
    }

    canAffect(card: Card, context: AbilityContext): boolean {
        if (!isAttackableLocation(card.location)) {
            return false;
        }
        if (!card.checkRestrictions('receiveDamage', context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { amount, isCombatDamage } = this.getProperties(context, additionalProperties) as IDamageProperties;
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
