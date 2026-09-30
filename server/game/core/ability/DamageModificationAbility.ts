import { DamageModificationSystem } from '../../gameSystems/DamageModificationSystem';
import { IncreaseAbilityDamageSystem } from '../../gameSystems/IncreaseAbilityDamageSystem';
import type { IDamageModificationAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type { PlayerOrCardAbility } from './PlayerOrCardAbility';
import type { AbilityContext } from './AbilityContext';
import type { Game } from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import { AggregateSystem } from '../gameSystem/AggregateSystem';
import { DamageSystem, type IHypotheticalDamageEvent } from '../../gameSystems/DamageSystem';
import { IndirectDamageToPlayerSystem } from '../../gameSystems/IndirectDamageToPlayerSystem';
import { DistributeDamageSystem } from '../../gameSystems/DistributeDamageSystem';
import { DistributeIndirectDamageToCardsSystem } from '../../gameSystems/DistributeIndirectDamageToCardsSystem';
import { EnumHelpers } from '../utils/EnumHelpers';
import { Helpers } from '../utils/Helpers';
import { Contract } from '../utils/Contract';
import { DamageSourceType } from '../../IDamageOrDefeatSource';
import ReplacementAbilityBase from './ReplacementAbilityBase';
import { registerState } from '../GameObjectUtils';
import { DamageModificationType, EventName } from '../Constants';

export interface IPredictedDamageModification {

    /** True if a player may choose not to apply the modification */
    optional: boolean;

    /** The amount of damage that would be dealt after the modification, where 0 means the damage is prevented or replaced */
    modifiedAmount: number;
}

@registerState()
export default class DamageModificationAbility extends ReplacementAbilityBase {
    private readonly modificationProperties: IDamageModificationAbilityProps;

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

        this.modificationProperties = properties;
    }

    public override isDamageModificationAbility(): this is DamageModificationAbility {
        return true;
    }

    /**
     * Predicts how this ability would modify a damage event before the damage is dealt, using the same trigger conditions as
     * the real event. Returns null if the ability would not trigger.
     *
     * Abilities that apply at ability initiation (e.g. Ty Yorrick) have already been applied to the event's amount by the time
     * damage is dealt, so they are never predicted here.
     *
     * @param damageEvent A hypothetical damage event from {@link DamageSystem.buildHypotheticalDamageEvent}
     */
    public predictModification(damageEvent: IHypotheticalDamageEvent): IPredictedDamageModification | null {
        if (
            this.modificationProperties.applyAtAbilityInitiation ||
            !this.isListeningForEvents ||
            !this.card.canRegisterTriggeredAbilities() ||
            !this.card.getTriggeredAbilities().includes(this)
        ) {
            return null;
        }

        const listener = this.when?.[EventName.OnDamageDealt];
        if (!listener) {
            return null;
        }

        for (const player of this.game.getPlayers()) {
            const context = this.createContext(player, damageEvent);
            if (listener(damageEvent, context) && this.meetsRequirements(context) === '' && this.checkGameActionsForPotential(context)) {
                return {
                    optional: !!this.modificationProperties.optional || !!this.modificationProperties.onlyIfYouDoEffect,
                    modifiedAmount: this.getModifiedDamageAmount(damageEvent)
                };
            }
        }

        return null;
    }

    /** Mirrors {@link DamageModificationSystem} to compute the damage that would be dealt after this modification */
    private getModifiedDamageAmount(damageEvent: IHypotheticalDamageEvent): number {
        const { modificationType, amount } = this.modificationProperties;

        switch (modificationType) {
            case DamageModificationType.Increase:
                return damageEvent.amount + amount;
            case DamageModificationType.Multiply:
                return damageEvent.amount * amount;
            case DamageModificationType.Cap:
                return damageEvent.isUnpreventable ? damageEvent.amount : Math.min(damageEvent.amount, amount);
            case DamageModificationType.Reduce:
                return damageEvent.isUnpreventable ? damageEvent.amount : Math.max(damageEvent.amount - amount, 0);
            case DamageModificationType.PreventAll:
            case DamageModificationType.Replace:
                return damageEvent.isUnpreventable ? damageEvent.amount : 0;
            default:
                Contract.fail(`Unknown modificationType ${modificationType} for DamageModificationAbility`);
        }
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
