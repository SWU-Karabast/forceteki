import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, DamageType, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { Attack } from '../core/attack/Attack';
import type { IDamagedOrDefeatedByAbility, IDamagedOrDefeatedByAttack } from '../IDamageOrDefeatSource';
import { DamageSourceType } from '../IDamageOrDefeatSource';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface IDamagePropertiesBase extends ICardTargetSystemProperties {
    type: DamageType;
}

export interface ICombatDamageProperties extends IDamagePropertiesBase {
    type: DamageType.Combat;
    amount: number;

    /** The attack that is the source of the damage */
    sourceAttack: Attack;

    /** The source of the damage, if different from the attacker / defender card (e.g. Maul1 unit ability) */
    source?: Card;
}

/** Used for when an ability is directly dealing damage to a target (most common case for card implementations) */
export interface IAbilityDamageProperties extends IDamagePropertiesBase {
    type: DamageType.Ability;
    amount: number | ((card: IUnitCard) => number);

    /** The source of the damage, if different from the card that triggered the ability */
    source?: Card;

    /** Whether this damage is indirect damage or not */
    isIndirect?: boolean;
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
        type: DamageType.Ability,
        isIndirect: false
    };

    public eventHandler(event): void {
        const eventDamageAmount = this.getDamageAmountFromEvent(event);

        event.damageDealt = event.card.addDamage(eventDamageAmount, event.damageSource);

        // excess damage can be "used up" by effects such as Overwhelm, making it unavailable for other effects such Blizzard Assault AT-AT
        // see unofficial dev ruling at https://nexus.cascadegames.com/resources/Rules_Clarifications/
        if (event.sourceEventForExcessDamage) {
            event.sourceEventForExcessDamage.availableExcessDamage = 0;
        }

        event.availableExcessDamage = eventDamageAmount - event.damageDealt;
    }

    private getDamageAmountFromEvent(event: any): number {
        if (event.amount != null) {
            return event.amount;
        }

        Contract.assertHasProperty(event, 'sourceEventForExcessDamage', 'Damage event does not have damage amount or source event to get excess damage amount from');
        Contract.assertHasProperty(event.sourceEventForExcessDamage, 'availableExcessDamage', 'Damage event is missing excess damage amount');

        return event.sourceEventForExcessDamage.availableExcessDamage;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (
            properties.type === DamageType.Overwhelm && 'contingentSourceEvent' in properties &&
            properties.contingentSourceEvent.availableExcessDamage === 0
        ) {
            return false;
        }

        if (!EnumHelpers.isAttackableZone(card.zoneName)) {
            return false;
        }

        // check cases where a game state change is required
        if (properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) {
            if (card.hasRestriction(AbilityRestriction.ReceiveDamage, context) && (properties.type !== DamageType.Ability || !properties.isIndirect)) {
                return false;
            }

            if ('amount' in properties) {
                if (typeof properties.amount === 'function') {
                    Contract.assertTrue(card.isUnit());

                    if (properties.amount(card) === 0) {
                        return false;
                    }
                }

                if (properties.amount === 0) {
                    return false;
                }
            }

            if ('sourceEventForExcessDamage' in properties && properties.sourceEventForExcessDamage.availableExcessDamage === 0) {
                return false;
            }
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

        Contract.assertTrue(card.canBeDamaged());

        const damageAmount = this.getDamageAmountFromEvent(event);
        event.availableExcessDamage = damageAmount - Math.min(damageAmount, card.remainingHp);

        // Check if the damage will defeat the card, this can be used by abilities (e.g. Tarfful) to determine if the card will be defeated or not
        event.willDefeat = damageAmount >= card.remainingHp;
    }

    private addAttackDamagePropertiesToEvent(event: any, card: Card, context: TContext, properties: ICombatDamageProperties): void {
        Contract.assertTrue(context.source.isUnit());
        Contract.assertNotNullLike(card);

        let damageDealtBy: IUnitCard;

        if (properties.source) {
            Contract.assertTrue(properties.source.isUnit());
            damageDealtBy = properties.source;
        } else if (event.isOverwhelmDamage) {
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

    private addAbilityDamagePropertiesToEvent(event: any, card: Card, context: TContext, properties: IAbilityDamageProperties): void {
        const abilityDamageSource: IDamagedOrDefeatedByAbility = {
            type: DamageSourceType.Ability,
            player: properties.source?.controller ?? context.player,
            card: properties.source ?? context.source,
            event
        };

        if (context.isTriggered() && context.event.name === EventName.OnCardDefeated) {
            // For the case where a stolen card is defeated, the card.controller has already reverted back
            // to the card's owner. We need to use the last known information to get the correct controller
            // for damage attribution (e.g. for Jango's ability)
            abilityDamageSource.controller = context.event.lastKnownInformation.controller;
        }

        event.isIndirect = properties.isIndirect;
        event.damageSource = abilityDamageSource;
        event.amount = typeof properties.amount === 'function' ? (properties.amount as (Event) => number)(card) : properties.amount;
    }

    // TODO: might need to refactor getEffectMessage generally so that it has access to the event, doesn't really work for some of the damage scenarios currently
    // public override getEffectMessage(context: TContext): [string, any[]] {
    //     const properties = this.generatePropertiesFromContext(context);

    //     const damageTypeStr = isCombatDamage ? ' combat' : '';

    //     return ['deal {0}{1} damage to {2}', [amount, damageTypeStr, target]];
    // }
}
