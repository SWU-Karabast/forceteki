import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface IHealProperties extends ICardTargetSystemProperties {
    amount: number | ((card: IUnitCard) => number);
}

export class HealSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IHealProperties> {
    public override readonly name = 'heal';
    public override readonly eventName = EventName.OnDamageHealed;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    public eventHandler(event): void {
        event.damageHealed = event.card.removeDamage(event.healAmount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { amount, target } = this.generatePropertiesFromContext(context);

        return ['heal {0} damage from {1}', [amount, this.getTargetMessage(target, context)]];
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IHealProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!card.canBeDamaged()) {
            return false;
        }
        if (!EnumHelpers.isAttackableZone(card.zoneName)) {
            return false;
        }
        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && (properties.amount === 0 || card.damage === 0 || card.hasRestriction(AbilityRestriction.BeHealed, context))) {
            return false;
        }
        return super.canAffectInternal(card, context);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Partial<IHealProperties>): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.healAmount = typeof amount === 'function' ? (amount as (Event) => number)(card) : amount;
        event.damageHealed = 0; // initialize damageHealed in case the event is cancelled
    }
}
