import type { Card } from '../core/card/Card';
import AbilityResolver from '../core/gameSteps/AbilityResolver';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { UnitCard } from '../core/card/CardTypes';
import { InitiateAttackAction } from '../actions/InitiateAttackAction';
import { AbilityContext } from '../core/ability/AbilityContext';
import Contract from '../core/utils/Contract';
import { IAttackProperties } from './AttackSystem';

export interface IInitiateUnitAttackProperties extends ICardTargetSystemProperties {
    ignoredRequirements?: string[];
    attackProperties?: IAttackProperties;
}

export class InitiateUnitAttackSystem extends CardTargetSystem<IInitiateUnitAttackProperties> {
    public override readonly name = 'initiateUnitAttack';
    protected override readonly defaultProperties: IInitiateUnitAttackProperties = {
        ignoredRequirements: [],
    };

    public eventHandler(event, additionalProperties): void {
        const player = event.player;
        const newContext = (event.attackAbility as InitiateAttackAction).createContext(player);
        event.context.game.queueStep(new AbilityResolver(event.context.game, newContext, true));
    }

    public override getEffectMessage(context: TriggeredAbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['initiate attack with {0}', [properties.target]];
    }

    protected override addPropertiesToEvent(event, target, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (!Contract.assertTrue(target.isUnit())) {
            return;
        }

        super.addPropertiesToEvent(event, target, context, additionalProperties);
        event.attackAbility = new InitiateAttackAction(target, properties.attackProperties);
    }

    public override canAffect(card: Card, context: TriggeredAbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (
            !card.isUnit() ||
            !super.canAffect(card, context)
        ) {
            return false;
        }

        const attackAbility = new InitiateAttackAction(card, properties.attackProperties);
        const newContext = attackAbility.createContext(context.player);

        // TODO THIS PR: rename meetsRequirements
        return !attackAbility.meetsRequirements(newContext, properties.ignoredRequirements);
    }
}
