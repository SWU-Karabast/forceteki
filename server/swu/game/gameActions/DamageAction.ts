import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../card/basecard';
import { CardTypes, EventNames, isArena, isAttackableLocation } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface DamageProperties extends CardActionProperties {
    amount?: number;
    isCombatDamage?: boolean;
}

export class DamageAction extends CardGameAction<DamageProperties> {
    name = 'damage';
    eventName = EventNames.OnDamageDealt;
    targetType = [CardTypes.Unit, CardTypes.Base];

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target, isCombatDamage } = this.getProperties(context) as DamageProperties;

        if (isCombatDamage) {
            return ['deal {1} combat damage to {0}', [amount, target]];
        } else {
            return ['deal {1} damage to {0}', [amount, target]];
        }
    }

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (!isAttackableLocation(card.location)) {
            return false;
        }
        if (!card.checkRestrictions('receiveDamage', context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    addPropertiesToEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        const { amount, isCombatDamage } = this.getProperties(context, additionalProperties) as DamageProperties;
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
