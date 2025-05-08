import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired } from '../core/Constants';
import type { GameObject } from '../core/GameObject';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { Player } from '../core/Player';

export interface ISimultaneousOrSequentialSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    gameSystems: GameSystem<TContext>[];

    targetingEnforcement?: TargetingEnforcement;
}

export enum TargetingEnforcement {
    Default = 'default',
    // Assume all systems have a legal target.
    // Needed for situations where there currently isn't a target but an earlier system in the chain will create one.
    IgnoreAll = 'ignoreAll',
    // Enforce all systems to have a legal target.
    EnforceAll = 'enforceAll',
}

export abstract class SimultaneousOrSequentialSystem<TProps extends ISimultaneousOrSequentialSystemProperties<TContext>, TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, TProps> {
    protected override readonly defaultProperties: ISimultaneousOrSequentialSystemProperties<TContext> = {
        gameSystems: [],
        targetingEnforcement: TargetingEnforcement.Default,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public override getInnerSystems(properties: TProps) {
        return properties.gameSystems;
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<TProps> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.targetingEnforcement === TargetingEnforcement.EnforceAll) {
            for (const candidateTarget of this.targets(context, additionalProperties)) {
                if (this.canAffect(candidateTarget, context, additionalProperties, mustChangeGameState)) {
                    return true;
                }
            }
            return false;
        }

        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    public override canAffectInternal(target: GameObject, context: TContext, additionalProperties: Partial<TProps> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.targetingEnforcement === TargetingEnforcement.EnforceAll) {
            return properties.gameSystems.every((gameSystem) => gameSystem.canAffect(target, context, additionalProperties, mustChangeGameState));
        }

        return properties.gameSystems.some((gameSystem) => gameSystem.canAffect(target, context, additionalProperties, mustChangeGameState));
    }

    public override allTargetsLegal(context: TContext, additionalProperties: Partial<TProps> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.targetingEnforcement === TargetingEnforcement.EnforceAll) {
            return properties.gameSystems.every((gameSystem) => gameSystem.allTargetsLegal(context, additionalProperties));
        }
        return properties.gameSystems.some((gameSystem) => gameSystem.allTargetsLegal(context, additionalProperties));
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<TProps> = {}) {
        const properties = this.generatePropertiesFromContext(context);
        return properties.gameSystems.some((gameSystem) =>
            gameSystem.hasTargetsChosenByPlayer(context, player, additionalProperties)
        );
    }
}
