import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import * as CardHelpers from '../core/card/CardHelpers';
import { CardWithDamageProperty, UnitCard } from '../core/card/CardTypes';

export interface IHealProperties extends ICardTargetSystemProperties {
    amount: number | ((card: UnitCard) => number);
}

export class HealSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IHealProperties> {
    public override readonly name = 'heal';
    public override readonly eventName = EventName.OnDamageRemoved;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    public eventHandler(event): void {
        event.damageRemoved = event.card.removeDamage(event.healAmount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { amount, target } = this.generatePropertiesFromContext(context);

        return ['heal {1} damage from {0}', [amount, target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!card.canBeDamaged()) {
            return false;
        }
        if (!EnumHelpers.isAttackableZone(card.zoneName)) {
            return false;
        }
        if (properties.isCost && (properties.amount === 0 || card.damage === 0)) {
            return false;
        }
        if (card.hasRestriction(AbilityRestriction.BeHealed, context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.healAmount = typeof amount === 'function' ? (amount as (Event) => number)(card) : amount;
    }
}
