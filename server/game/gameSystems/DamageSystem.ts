import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, DamageType, EventName, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { Attack } from '../core/attack/Attack';
import { DamageSourceType, IDamagedOrDefeatedByAbility, IDamagedOrDefeatedByAttack, IDamageSource } from '../IDamageOrDefeatSource';
import { UnitCard } from '../core/card/CardTypes';
import CardAbilityStep from '../core/ability/CardAbilityStep';

export interface IDamagePropertiesBase extends ICardTargetSystemProperties {
    type?: DamageType;
}

export interface ICombatDamageProperties extends IDamagePropertiesBase {
    type: DamageType.Combat;
    amount: number;

    /** The attack that is the source of the damage */
    sourceAttack: Attack;
}

/** Used for when an ability is directly dealing damage to a target (most common case for card implementations) */
export interface IAbilityDamageProperties extends IDamagePropertiesBase {
    type?: DamageType.Ability;    // this is optional so it can be the default property type
    amount: number;
}

/** Used for abilities that use the excess damage from another instance of damage (currently just Blizzard Assault AT-AT) */
export interface IExcessDamageProperties extends IDamagePropertiesBase {
    type: DamageType.Excess;
    sourceEventForExcessDamage: any;
}

/** Used for "standard" Overwhelm when the event will be using the excess damage from a resolved attack damage event */
export interface IExcessDamageOverwhelmProperties extends IDamagePropertiesBase {
    type: DamageType.Overwhelm;
    sourceAttack: Attack;

    /**
     * Combat damage event that this Overwhelm damage is contingent on
     */
    contingentSourceEvent: any;
}

/** Used for the situation when the defender is defeated before the attack damage step so all damage becomes Overwhelm damage */
export interface IFullOverwhelmDamageProperties extends IDamagePropertiesBase {
    type: DamageType.Overwhelm;
    sourceAttack: Attack;
    amount: number;
}

type IOverwhelmDamageProperties = IExcessDamageOverwhelmProperties | IFullOverwhelmDamageProperties;

export type IDamageProperties =
  | ICombatDamageProperties
  | IAbilityDamageProperties
  | IExcessDamageProperties
  | IOverwhelmDamageProperties;

// TODO: for this and the heal system, need to figure out how to handle the situation where 0 damage
// is dealt / healed. Since the card is technically still a legal target but no damage was technically
// dealt / healed per the rules (SWU 8.31.3)
export class DamageSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IDamageProperties = IAbilityDamageProperties> extends CardTargetSystem<TContext, TProperties> {
    public override readonly name: string = 'damage';
    public override readonly eventName = EventName.OnDamageDealt;

    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    protected override defaultProperties: IAbilityDamageProperties = {
        amount: null,
        type: DamageType.Ability
    };

    public eventHandler(event): void {
        const eventDamageAmount = this.getDamageAmountFromEvent(event);

        event.damageDealt = event.card.addDamage(eventDamageAmount, event.damageSource);

        event.availableExcessDamage = eventDamageAmount - event.damageDealt;
    }

    private getDamageAmountFromEvent(event: any): number {
        if (event.amount != null) {
            return event.amount;
        }

        Contract.assertHasProperty(event, 'sourceEventForExcessDamage', 'Damage event does not have damage amount or source event to get excess damage amount from');
        Contract.assertHasProperty(event.sourceEventForExcessDamage, 'availableExcessDamage', 'Damage event is missing excess damage amount');

        const availableExcessDamage = event.sourceEventForExcessDamage.availableExcessDamage;

        if (availableExcessDamage === 0) {
            return 0;
        }

        // excess damage can be "used up" by effects such as Overwhelm, making it unavailable for other effects such Blizzard Assault AT-AT
        // see unofficial dev ruling at https://nexus.cascadegames.com/resources/Rules_Clarifications/
        event.sourceEventForExcessDamage.availableExcessDamage = 0;
        return availableExcessDamage;
    }

    public override canAffect(card: Card, context: TContext): boolean {
        const properties = this.generatePropertiesFromContext(context);

        // short-circuits to pass targeting if damage amount is set at 0 either directly or via a resolved source event
        if (
            'amount' in properties && properties.amount === 0 ||
            'sourceEventForExcessDamage' in properties && properties.sourceEventForExcessDamage.availableExcessDamage === 0
        ) {
            return false;
        }
        if (
            properties.type === DamageType.Overwhelm && 'contingentSourceEvent' in properties &&
            properties.contingentSourceEvent.availableExcessDamage === 0
        ) {
            return false;
        }

        if (!EnumHelpers.isAttackableLocation(card.location)) {
            return false;
        }
        if (card.hasRestriction(AbilityRestriction.ReceiveDamage, context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.type = properties.type;

        switch (properties.type) {
            case DamageType.Combat:
                this.addAttackDamagePropertiesToEvent(event, card, context, properties);
                break;
            case DamageType.Ability:
                this.addAbilityDamagePropertiesToEvent(event, card, context, properties);
                break;
            case DamageType.Excess:
                this.addExcessDamagePropertiesToEvent(event, card, context, properties);
                break;
            case DamageType.Overwhelm:
                this.addOverwhelmDamagePropertiesToEvent(event, card, context, properties);
                break;
            default:
                Contract.fail(`Unexpected damage type: ${properties['type']}`);
        }
    }

    private addAttackDamagePropertiesToEvent(event: any, card: Card, context: TContext, properties: ICombatDamageProperties): void {
        Contract.assertTrue(context.source.isUnit());
        Contract.assertNotNullLike(card);

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
                    Contract.fail(`Combat damage is being dealt to card ${card.internalName} but it is not involved in the attack`);
            }
        }

        const attackDamageSource: IDamagedOrDefeatedByAttack = {
            type: DamageSourceType.Attack,
            attack: properties.sourceAttack,
            player: context.source.controller,
            damageDealtBy,
            isOverwhelmDamage: false,
            event
        };

        event.damageSource = attackDamageSource;
        event.amount = properties.amount;
    }

    private addOverwhelmDamagePropertiesToEvent(event: any, card: Card, context: TContext, properties: IOverwhelmDamageProperties): void {
        Contract.assertTrue(card.isBase(), `Attempting to target non-base card ${card.internalName} with Overwhelm damage`);

        if ('amount' in properties && properties.amount != null) {
            event.amount = properties.amount;
        } else if ('contingentSourceEvent' in properties && properties.contingentSourceEvent != null) {
            event.sourceEventForExcessDamage = properties.contingentSourceEvent;
        } else {
            Contract.fail('Unexpected Overwhelm damage properties');
        }

        const overwhelmDamageSource: IDamagedOrDefeatedByAttack = {
            type: DamageSourceType.Attack,
            attack: properties.sourceAttack,
            player: context.source.controller,
            damageDealtBy: properties.sourceAttack.attacker,
            isOverwhelmDamage: true,
            event
        };

        event.damageSource = overwhelmDamageSource;
    }

    private addExcessDamagePropertiesToEvent(event: any, card: Card, context: TContext, properties: IExcessDamageProperties): void {
        const excessDamageSource: IDamagedOrDefeatedByAbility = {
            type: DamageSourceType.Ability,
            player: context.player,
            card: context.source,
            event
        };

        event.damageSource = excessDamageSource;
        event.sourceEventForExcessDamage = properties.sourceEventForExcessDamage;
    }

    // TODO: confirm that this works when the player controlling the ability is different than the player controlling the card (e.g., bounty)
    private addAbilityDamagePropertiesToEvent(event: any, card: Card, context: TContext, properties: IAbilityDamageProperties): void {
        const abilityDamageSource: IDamagedOrDefeatedByAbility = {
            type: DamageSourceType.Ability,
            player: context.player,
            card: context.source,
            event
        };

        event.damageSource = abilityDamageSource;
        event.amount = properties.amount;
    }

    // TODO: might need to refactor getEffectMessage generally so that it has access to the event, doesn't really work for some of the damage scenarios currently
    // public override getEffectMessage(context: TContext): [string, any[]] {
    //     const properties = this.generatePropertiesFromContext(context);

    //     const damageTypeStr = isCombatDamage ? ' combat' : '';

    //     return ['deal {0}{1} damage to {2}', [amount, damageTypeStr, target]];
    // }
}
