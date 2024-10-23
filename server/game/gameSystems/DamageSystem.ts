import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { Attack } from '../core/attack/Attack';
import { DamageSourceType, IDamageSource } from '../IDamageOrDefeatSource';
import { UnitCard } from '../core/card/CardTypes';
import CardAbilityStep from '../core/ability/CardAbilityStep';
import { IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface IDamageProperties extends ICardTargetSystemProperties {
    amount: number;
    isCombatDamage?: boolean;

    /** must be provided if-and-only-if isCombatDamage = true */
    sourceAttack?: Attack;
}

// TODO: for this and the heal system, need to figure out how to handle the situation where 0 damage
// is dealt / healed. Since the card is technically still a legal target but no damage was technically
// dealt / healed per the rules (SWU 8.31.3)
export class DamageSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDamageProperties> {
    public override readonly name = 'damage';
    public override readonly eventName = EventName.OnDamageDealt;

    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    protected override defaultProperties: IDamageProperties = {
        amount: null,
        isCombatDamage: false
    };

    public eventHandler(event): void {
        const damageAdded = event.card.addDamage(event.damage, event.damageSource);

        event.damageAdded = damageAdded;

        // excess damage can be "used up" by effects such as Overwhelm, making it unavailable for other effects such Blizzard Assault AT-AT
        // see unofficial dev ruling at https://nexus.cascadegames.com/resources/Rules_Clarifications/
        event.availableExcessDamage = event.damage - damageAdded;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { amount, target, isCombatDamage } = this.generatePropertiesFromContext(context);

        const damageTypeStr = isCombatDamage ? ' combat' : '';

        return ['deal {0}{1} damage to {2}', [amount, damageTypeStr, target]];
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

        Contract.assertTrue(!!properties.sourceAttack === properties.isCombatDamage, 'Source attack must be provided if and only if isCombatDamage is true');

        return properties;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.damage = properties.amount;
        event.isCombatDamage = properties.isCombatDamage;
        event.isOverwhelmDamage = false;

        event.damageSource = event.isCombatDamage
            ? this.generateAttackSourceMetadata(event, card, context, properties)
            : this.generateAbilitySourceMetadata(card, context);
    }

    /** Generates metadata indicating the source of the damage is an attack for relevant effects such as Rukh's ability */
    private generateAttackSourceMetadata(event: any, card: Card, context: TContext, properties: IDamageProperties): IDamageSource {
        Contract.assertTrue(context.source.isUnit());

        let damageDealtBy: UnitCard;

        if (event.isOverwhelmDamage) {
            damageDealtBy = properties.sourceAttack.attacker;
        } else {
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
        }

        return {
            type: DamageSourceType.Attack,
            attack: properties.sourceAttack,
            player: context.source.controller,
            damageDealtBy,
            isOverwhelmDamage: false
        };
    }

    // TODO: confirm that this works when the player controlling the ability is different than the player controlling the card (e.g., bounty)
    /** Generates metadata indicating the source of the damage is an ability */
    private generateAbilitySourceMetadata(card: Card, context: TContext): IDamageSource {
        Contract.assertTrue(context.ability instanceof CardAbilityStep, `Damage was created by non-card ability ${context.ability.title} targeting ${card.internalName}`);

        return {
            type: DamageSourceType.Ability,
            player: context.player,
            ability: context.ability,
            card: context.source
        };
    }
}
