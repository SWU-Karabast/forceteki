import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { UnitCard } from '../core/card/CardTypes';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount: number | ((card: UnitCard) => number);
    isCombatDamage?: boolean;
    isOverwhelmDamage?: boolean;
}

// TODO: for this and the heal system, need to figure out how to handle the situation where 0 damage
// is dealt / healed. Since the card is technically still a legal target but no damage was technically
// dealt / healed per the rules (SWU 8.31.3)
export class DamageSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDamageProperties> {
    public override readonly name = 'damage';
    public override readonly eventName = EventName.OnDamageDealt;

    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    public eventHandler(event): void {
        if (typeof event.damage === 'number') {
            event.card.addDamage(event.damage);
        } else {
            event.card.addDamage(event.damage(event.card));
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { amount, target, isCombatDamage } = this.generatePropertiesFromContext(context);

        if (isCombatDamage) {
            return ['deal {1} combat damage to {0}', [amount, target]];
        }
        return ['deal {1} damage to {0}', [amount, target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (!EnumHelpers.isAttackableLocation(card.location)) {
            return false;
        }
        if (card.hasRestriction(AbilityRestriction.ReceiveDamage, context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties?: any) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertFalse(properties.isCombatDamage && properties.isOverwhelmDamage, 'Overwhelm damage must not be combat damage');

        return properties;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.damage = properties.amount;
        event.isCombatDamage = properties.isCombatDamage;
        event.isOverwhelmDamage = properties.isOverwhelmDamage;
    }
}
