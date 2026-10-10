import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired } from '../core/Constants';
import type { GameObject } from '../core/GameObject';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { Player } from '../core/Player';

export interface ISimultaneousOrSequentialSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    gameSystems: GameSystem<TContext>[];

    resolutionMode?: ResolutionMode;
}

export enum ResolutionMode {
    SomeGameSystemsMustBeLegal = 'someGameSystemsMustBeLegal',
    // Enforce all systems to have a legal target.
    AllGameSystemsMustBeLegal = 'allGameSystemsMustBeLegal',
    // Assume all systems have a legal target.
    // Needed for situations where there currently isn't a target but an earlier system in the chain will create one.
    AlwaysResolve = 'alwaysResolve',
}

export abstract class SimultaneousOrSequentialSystem<TProps extends ISimultaneousOrSequentialSystemProperties<TContext>, TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, TProps> {
    protected override readonly defaultProperties: IGameSystemInput<ISimultaneousOrSequentialSystemProperties<TContext>> = {
        gameSystems: [],
        resolutionMode: ResolutionMode.SomeGameSystemsMustBeLegal,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal() {}

    public override getInnerSystems(properties: TProps) {
        return properties.gameSystems;
    }

    protected override hasLegalTargetInternal(context: TContext, properties: TProps, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProps>> = {}): boolean {
        if (properties.resolutionMode === ResolutionMode.AlwaysResolve) {
            return true;
        } else if (properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal) {
            return properties.gameSystems.every((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties, mustChangeGameState));
        }

        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    protected override canAffectInternal(target: GameObject, context: TContext, properties: TProps, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProps>> = {}): boolean {
        if (properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal) {
            return properties.gameSystems.every((gameSystem) => gameSystem.canAffect(target, context, additionalProperties, mustChangeGameState));
        }

        return properties.gameSystems.some((gameSystem) => gameSystem.canAffect(target, context, additionalProperties, mustChangeGameState));
    }

    protected override allTargetsLegalInternal(context: TContext, properties: TProps, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProps>> = {}): boolean {
        if (properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal) {
            return properties.gameSystems.every((gameSystem) => gameSystem.allTargetsLegal(context, additionalProperties));
        }
        return properties.gameSystems.some((gameSystem) => gameSystem.allTargetsLegal(context, additionalProperties));
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<TProps>> = {}) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.gameSystems.some((gameSystem) =>
            gameSystem.hasTargetsChosenByPlayer(context, player, additionalProperties)
        );
    }
}
