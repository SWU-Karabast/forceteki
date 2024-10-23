import { AbilityContext } from '../core/ability/AbilityContext';
import { Attack } from '../core/attack/Attack';
import { AbilityRestriction, CardType, EventName } from '../core/Constants';
import { DamageSourceType, IDamageSource } from '../IDamageOrDefeatSource';
import * as Contract from '../core/utils/Contract';
import { Card } from '../core/card/Card';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

export interface IOverwhelmDamageProperties extends ICardTargetSystemProperties {

    /**
     * Combat damage event that this overwhelm is contingent on. Should not be provided if the defender
     * was already defeated and all damage becomes overwhelm damage. Mutually exclusive with `amount`.
     */
    contingentSourceEvent?: any;

    /**
     * Damage to deal to base. This should provided if-and-only-if the defender was already defeated and
     * all damage is overwhelm damage. Mutually exclusive with `contingentSourceEvent`.
     */
    amount?: number;

    sourceAttack: Attack;
}

export class OverwhelmDamageSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IOverwhelmDamageProperties> {
    public override readonly name = 'overwhelm damage';
    public override readonly eventName = EventName.OnDamageDealt;
    protected override readonly targetTypeFilter = [CardType.Base];

    public override eventHandler(event): void {
        Contract.assertTrue(event.card.isBase());

        // if an amount was directly specified, there's no contingent combat damage event and we just deal the damage to the base
        if (event.amount != null) {
            event.card.addDamage(event.amount, event.damageSource);
            return;
        }

        const combatDamageEvent = event.contingentSourceEvent;

        if (combatDamageEvent.cancelled || combatDamageEvent.availableExcessDamage === 0) {
            return;
        }

        // excess damage can be "used up" by effects such as Overwhelm, making it unavailable for other effects such Blizzard Assault AT-AT
        // see unofficial dev ruling at https://nexus.cascadegames.com/resources/Rules_Clarifications/
        const overwhelmDamage = combatDamageEvent.availableExcessDamage;
        combatDamageEvent.availableExcessDamage = 0;

        event.card.addDamage(overwhelmDamage, event.damageSource);
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (card.hasRestriction(AbilityRestriction.ReceiveDamage, context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties?: any) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertTrue(
            !!properties.contingentSourceEvent !== !!properties.amount,
            'Overwhelm amount cannot be specified if there is a combat damage event resolving as well'
        );

        if (properties.contingentSourceEvent != null) {
            Contract.assertTrue(properties.contingentSourceEvent.isCombatDamage, 'Overwhelm damage cannot be contingent on non-combat damage');
        }

        return properties;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.isCombatDamage = false;
        event.isOverwhelmDamage = true;
        event.contingentSourceEvent = properties.contingentSourceEvent;
        event.amount = properties.amount;

        const overwhelmDamageSource: IDamageSource = {
            type: DamageSourceType.Attack,
            attack: properties.sourceAttack,
            player: context.source.controller,
            damageDealtBy: properties.sourceAttack.attacker,
            isOverwhelmDamage: true,
            event
        };

        event.damageSource = overwhelmDamageSource;
    }
}
