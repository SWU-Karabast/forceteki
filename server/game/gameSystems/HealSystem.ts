import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface IHealProperties extends ICardTargetSystemProperties {
    amount: number | ((card: IUnitCard) => number);
}

export class HealSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IHealProperties> {
    public override readonly name = 'heal';
    public override readonly eventName = EventName.OnDamageHealed;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    protected override eventHandlerInternal(event): void {
        event.damageHealed = event.card.removeDamage(event.amount);
    }

    protected override getEffectMessageInternal(context: TContext, properties: IHealProperties): [string, any[]] {
        const { amount, target } = properties;

        return ['heal {0} damage from {1}', [amount, this.getTargetMessage(target, context)]];
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IHealProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.canBeDamaged()) {
            return false;
        }
        if (!EnumHelpers.isAttackableZone(card.zoneName)) {
            return false;
        }
        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && (properties.amount === 0 || card.damage === 0 || card.hasRestriction(AbilityRestriction.BeHealed, context))) {
            return false;
        }
        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, properties: IHealProperties): void {
        const { amount } = properties;
        super.addPropertiesToEvent(event, card, context, properties);
        event.amount = typeof amount === 'function' ? (amount as (Event) => number)(card) : amount;
        event.damageHealed = 0; // initialize damageHealed in case the event is cancelled
    }
}
