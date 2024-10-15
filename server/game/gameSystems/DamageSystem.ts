import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { Attack } from '../core/attack/Attack';
import { DamageOrDefeatSourceType, IDamageOrDefeatSource } from '../IDamageOrDefeatSource';
import CardAbility from '../core/ability/CardAbility';
import { UnitCard } from '../core/card/CardTypes';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount: number;
    isOverwhelmDamage?: boolean;
    isCombatDamage?: boolean;

    /** must be provided if-and-only-if isCombatDamamge = true */
    sourceAttack?: Attack;
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
        const { amount, target, sourceAttack } = this.generatePropertiesFromContext(context);

        if (sourceAttack) {
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
        Contract.assertTrue(!!properties.isCombatDamage === !!properties.sourceAttack, 'Source attack must be provided if and only if isCombatDamage is true');

        return properties;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.damage = properties.amount;
        event.isCombatDamage = !!properties.sourceAttack;
        event.isOverwhelmDamage = properties.isOverwhelmDamage;

        let damageSource: IDamageOrDefeatSource;
        if (event.isCombatDamage) {
            Contract.assertTrue(context.source.isUnit());

            let damageDealtBy: UnitCard;
            switch (card) {
                case properties.sourceAttack.attacker:
                    Contract.assertTrue(properties.sourceAttack.target.isUnit());
                    damageDealtBy = properties.sourceAttack.target;
                    break;
                case properties.sourceAttack.target:
                    damageDealtBy = properties.sourceAttack.attacker;
                    break;
                default:
                    Contract.fail(`Combat damage being dealt to card ${card.internalName} but it is not involved in the attack`);
            }

            damageSource = {
                type: DamageOrDefeatSourceType.Attack,
                attack: properties.sourceAttack,
                player: context.source.controller,
                damageDealtBy
            };
        } else {
            // TODO: confirm that this works when the player controlling the ability is different than the player controlling the card (e.g., bounty)
            damageSource = {
                type: DamageOrDefeatSourceType.Ability,
                player: context.player,
                ability: (context.ability as CardAbility),
                card: context.source
            };
        }

        event.damageSource = damageSource;
    }
}
