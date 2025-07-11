import type { Card } from '../core/card/Card';
import { AbilityResolver } from '../core/gameSteps/AbilityResolver';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { InitiateAttackAction } from '../actions/InitiateAttackAction';
import type { AbilityContext } from '../core/ability/AbilityContext';
import * as Contract from '../core/utils/Contract';
import type { IAttackProperties } from './AttackStepsSystem';
import { MetaEventName } from '../core/Constants';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface IInitiateAttackProperties<TContext extends AbilityContext = AbilityContext> extends IAttackProperties {
    ignoredRequirements?: string[];
    attackerCondition?: (card: Card, context: TContext) => boolean;
    isAmbush?: boolean;
    allowExhaustedAttacker?: boolean;

    /** By default, the system will inherit the `optional` property from the activating ability. Use this to override the behavior. */
    optional?: boolean;
}

/**
 * This system is a helper for initiating attacks from abilities (see {@link GameSystemLibrary.attack}).
 * The `target` property is the unit that will be attacking. The system resolves the {@link InitiateAttackAction}
 * ability for the passed unit, which will trigger resolution of the attack target.
 */
export class InitiateAttackSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IInitiateAttackProperties<TContext>> {
    public override readonly name = 'initiateUnitAttack';
    public override readonly eventName = MetaEventName.InitiateAttack;
    public override readonly effectDescription = 'initiate an attack with {0}';
    protected override readonly defaultProperties: IInitiateAttackProperties = {
        ignoredRequirements: [],
        attackerCondition: () => true,
        isAmbush: false,
        allowExhaustedAttacker: false
    };

    public eventHandler(event): void {
        const player = event.player;
        const newContext = (event.attackAbility as InitiateAttackAction).createContext(player);
        event.context.game.queueStep(new AbilityResolver(event.context.game, newContext, event.optional));
    }

    protected override addPropertiesToEvent(event, attacker: IUnitCard, context: TContext, additionalProperties: Partial<IInitiateAttackProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        Contract.assertTrue(attacker.isUnit());

        super.addPropertiesToEvent(event, attacker, context, additionalProperties);

        event.attackAbility = this.generateAttackAbilityNoTarget(attacker, properties);
        event.optional = properties.optional ?? context.ability.optional;
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IInitiateAttackProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (
            !card.isUnit() ||
            !super.canAffectInternal(card, context) ||
            !properties.attackerCondition(card, context)
        ) {
            return false;
        }

        const attackAbility = this.generateAttackAbilityNoTarget(card, properties);
        const newContext = attackAbility.createContext(context.player);

        return !attackAbility.meetsRequirements(newContext, properties.ignoredRequirements) &&
          attackAbility.hasSomeLegalTarget(newContext);
    }

    /**
     * Generate an attack ability for the specified card.
     * Uses the passed properties but strips out the `target` property to avoid overriding it in the attack.
     */
    private generateAttackAbilityNoTarget(card: IUnitCard, properties: IAttackProperties) {
        const { target, ...propertiesNoTarget } = properties;
        return new InitiateAttackAction(card.game, card, propertiesNoTarget);
    }
}
