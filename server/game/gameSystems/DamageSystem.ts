import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount?: number;
    isCombatDamage?: boolean;
}

// TODO: for this and the heal system, need to figure out how to handle the situation where 0 damage
// is dealt / healed. Since the card is technically still a legal target but no damage was technically
// dealt / healed per the rules (SWU 8.31.3)
export class DamageSystem extends CardTargetSystem<IDamageProperties> {
    public override readonly name = 'damage';
    public override readonly eventName = EventName.OnDamageDealt;

    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    public eventHandler(event): void {
        event.card.addDamage(event.damage);
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target, isCombatDamage } = this.generatePropertiesFromContext(context);

        if (isCombatDamage) {
            return ['deal {1} combat damage to {0}', [amount, target]];
        }
        return ['deal {1} damage to {0}', [amount, target]];
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        if (!EnumHelpers.isAttackableLocation(card.location)) {
            return false;
        }
        if (card.hasRestriction(AbilityRestriction.ReceiveDamage, context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    protected override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { amount, isCombatDamage } = this.generatePropertiesFromContext(context, additionalProperties) as IDamageProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.damage = amount;
        event.isCombatDamage = isCombatDamage;
        event.context = context;
    }
}
