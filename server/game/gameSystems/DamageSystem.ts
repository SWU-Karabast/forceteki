import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { Attack } from '../core/attack/Attack';
import { DamageOrDefeatSourceType, IDamageOrDefeatSource } from '../IDamageOrDefeatSource';
import CardAbility from '../core/ability/CardAbility';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount: number;
    isOverwhelmDamage?: boolean;

    /** if provided, indicates that the damage originated from an attack not a card ability */
    combatDamageSourceAttack?: Attack;
}

// TODO: for this and the heal system, need to figure out how to handle the situation where 0 damage
// is dealt / healed. Since the card is technically still a legal target but no damage was technically
// dealt / healed per the rules (SWU 8.31.3)
export class DamageSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDamageProperties> {
    public override readonly name = 'damage';
    public override readonly eventName = EventName.OnDamageDealt;

    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    public eventHandler(event): void {
        event.card.addDamage(event.damage);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { amount, target, combatDamageSourceAttack } = this.generatePropertiesFromContext(context);

        if (combatDamageSourceAttack) {
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

        Contract.assertFalse(!!properties.combatDamageSourceAttack && properties.isOverwhelmDamage, 'Overwhelm damage must not be combat damage');

        return properties;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.damage = properties.amount;
        event.isCombatDamage = !!properties.combatDamageSourceAttack;
        event.isOverwhelmDamage = properties.isOverwhelmDamage;

        if (event.isCombatDamage) {
            const damageSource: IDamageOrDefeatSource = {
                player: properties.combatDamageSourceAttack.attacker.controller,
                details: {
                    type: DamageOrDefeatSourceType.Attack,
                    attack: properties.combatDamageSourceAttack,
                    attacker: properties.combatDamageSourceAttack.attacker
                }
            };

            event.damageSource = damageSource;
            return;
        }

        // TODO: confirm that this works when the player controlling the ability is different than the player controlling the card (e.g., bounty)
        const damageSource: IDamageOrDefeatSource = {
            player: context.player,
            details: {
                type: DamageOrDefeatSourceType.Ability,
                ability: (context.ability as CardAbility),
                card: context.source
            }
        };
        event.damageSource = damageSource;
    }
}
