import { DamageModificationSystem } from '../../gameSystems/DamageModificationSystem';
import { IncreaseAbilityDamageSystem } from '../../gameSystems/IncreaseAbilityDamageSystem';
import type { IDamageModificationAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type { PlayerOrCardAbility } from './PlayerOrCardAbility';
import type { AbilityContext } from './AbilityContext';
import type { Game } from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import { AggregateSystem } from '../gameSystem/AggregateSystem';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import { IndirectDamageToPlayerSystem } from '../../gameSystems/IndirectDamageToPlayerSystem';
import { DistributeDamageSystem } from '../../gameSystems/DistributeDamageSystem';
import { DistributeIndirectDamageToCardsSystem } from '../../gameSystems/DistributeIndirectDamageToCardsSystem';
import { EnumHelpers } from '../utils/EnumHelpers';
import { Helpers } from '../utils/Helpers';
import { DamageSourceType } from '../../IDamageOrDefeatSource';
import ReplacementAbilityBase from './ReplacementAbilityBase';
import { registerState } from '../GameObjectUtils';

@registerState()
export default class DamageModificationAbility extends ReplacementAbilityBase {
    public constructor(game: Game, card: Card, properties: IDamageModificationAbilityProps) {
        const { onlyIfYouDoEffect, ...otherProps } = properties;

        const whenTrigger = properties.applyAtAbilityInitiation
            ? {
                onCardAbilityInitiated: (event, context) => this.buildAbilityInitiatedTrigger(event, context, properties),
                onAbilityResolverInitiated: (event, context) => this.buildAbilityInitiatedTrigger(event, context, properties)
            }
            : { onDamageDealt: (event, context) => this.buildDamageModificationTrigger(event, context, properties) };

        const replacementSystem = properties.applyAtAbilityInitiation
            ? new IncreaseAbilityDamageSystem({ amount: properties.amount })
            : new DamageModificationSystem(otherProps);

        super(game, card, properties, replacementSystem, whenTrigger);
    }

    private buildAbilityInitiatedTrigger(event, context, properties: IDamageModificationAbilityProps): boolean {
        const initiatedContext: AbilityContext = event.context;
        const initiatingCard = initiatedContext?.source;

        if (initiatingCard == null) {
            return false;
        }

        if (properties.onlyFromPlayer &&
          EnumHelpers.asConcretePlayer(properties.onlyFromPlayer, context.source.controller) !== initiatingCard.controller) {
            return false;
        }

        if (properties.damageOfType && properties.damageOfType !== DamageSourceType.Ability) {
            return false;
        }

        if (properties.shouldCardHaveDamageModification && properties.shouldCardHaveDamageModification(initiatingCard, context) === false) {
            return false;
        }

        return this.abilityCanDealDamage(initiatedContext.ability, initiatedContext);
    }

    private abilityCanDealDamage(ability: PlayerOrCardAbility, context: AbilityContext): boolean {
        if (ability == null) {
            return false;
        }

        // mirrors CardAbilityStep.getGameSystems which is protected
        const systems = ability.targetResolvers?.length > 0
            ? ability.targetResolvers.flatMap((target) => Helpers.asArray(target.getGameSystems(context)))
            : Helpers.asArray(ability.immediateEffect);

        // cost adjusters can also deal damage while the ability's costs are paid (e.g. Marauder)
        const costAdjusterSystems = ability.getCosts(context)
            .flatMap((cost) => (cost.isResourceCost() ? cost.getTargetedCostAdjusterEffectSystems(context) : []));

        return systems.concat(costAdjusterSystems).some((system) => this.systemDealsDamage(system, context));
    }

    private systemDealsDamage(system: GameSystem<AbilityContext>, context: AbilityContext): boolean {
        if (system == null) {
            return false;
        }

        if (
            system instanceof DamageSystem ||
            system instanceof IndirectDamageToPlayerSystem ||
            system instanceof DistributeDamageSystem ||
            system instanceof DistributeIndirectDamageToCardsSystem
        ) {
            return true;
        }

        const properties = system.generatePropertiesFromContext(context);

        if (system instanceof AggregateSystem) {
            return system.getInnerSystems(properties).some((innerSystem) => this.systemDealsDamage(innerSystem, context));
        }

        const gameSystems = (properties as any).gameSystems;
        if (gameSystems) {
            return Helpers.asArray(Helpers.derive(gameSystems, context)).some((innerSystem) => this.systemDealsDamage(innerSystem, context));
        }

        const onTrue = (properties as any).onTrue;
        const onFalse = (properties as any).onFalse;
        if (onTrue || onFalse) {
            return this.systemDealsDamage(onTrue, context) || this.systemDealsDamage(onFalse, context);
        }

        return false;
    }

    private buildDamageModificationTrigger(event, context, properties: IDamageModificationAbilityProps): boolean {
        // If a cardModificationCondition is provided, this means the damage modification should apply to the card that meets that condition instead of context.source
        if (properties.shouldCardHaveDamageModification) {
            if (properties.shouldCardHaveDamageModification(event.card, context) === false) {
                return false;
            }
        } else if (event.card !== context.source) {
            return false;
        }

        if (properties.damageOfType && event.damageSource.type !== properties.damageOfType) {
            return false;
        }

        if (properties.onlyFromPlayer) {
            return EnumHelpers.asConcretePlayer(properties.onlyFromPlayer, context.source.controller) === event.damageSource.player;
        }

        return true;
    }
}
