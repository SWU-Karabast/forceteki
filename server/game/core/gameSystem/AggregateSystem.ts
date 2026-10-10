import type { AbilityContext } from '../ability/AbilityContext';
import type { GameStateChangeRequired } from '../Constants';
import type { GameObject } from '../GameObject';
import type { IGameSystemProperties } from './GameSystem';
import { GameSystem } from './GameSystem';

// helper type useful for some extensions of this class
export type ISystemArrayOrFactory<TContext extends AbilityContext> = (GameSystem<TContext>)[] | ((context: TContext) => (GameSystem<TContext>)[]);

/**
 * Meta-system used for executing a set of other systems together.
 *
 * @template TContext Type of {@link AbilityContext} that this system uses for any method that accepts a context
 */
export abstract class AggregateSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IGameSystemProperties = IGameSystemProperties> extends GameSystem<TContext, TProperties> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal() {}

    public abstract getInnerSystems(properties: TProperties): GameSystem<TContext>[];

    protected override prepareProperties(context: TContext, properties: TProperties): void {
        super.prepareProperties(context, properties);

        // TODO: this seems to cause issues with player target system defaults when the list includes both a card target and player target system
        // if we have an assigned target, overwrite the default target on all inner systems
        for (const gameSystem of this.getInnerSystems(properties)) {
            if (properties.target !== null && (!Array.isArray(properties.target) || properties.target.length !== 0)) {
                gameSystem.setDefaultTargetFn(() => properties.target);
            } else {
                gameSystem.setDefaultTargetFn(() => gameSystem.defaultTargets(context));
            }
        }
    }

    protected abstract override hasLegalTargetInternal(context: TContext, properties: TProperties, mustChangeGameState: GameStateChangeRequired): boolean;

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }
}
