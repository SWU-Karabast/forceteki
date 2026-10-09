import type { AbilityContext } from '../ability/AbilityContext';
import type { CardTypeFilter, GameStateChangeRequired } from '../Constants';
import type { GameObject } from '../GameObject';
import type { IGameSystemProperties } from './GameSystem';
import { GameSystem } from './GameSystem';
import { Helpers } from '../utils/Helpers';

// helper type useful for some extensions of this class
export type ISystemArrayOrFactory<TContext extends AbilityContext> = (GameSystem<TContext>)[] | ((context: TContext) => (GameSystem<TContext>)[]);

/**
 * Meta-system used for executing a set of other systems together.
 *
 * @template TContext Type of {@link AbilityContext} that this system uses for any method that accepts a context
 */
export abstract class AggregateSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IGameSystemProperties = IGameSystemProperties> extends GameSystem<TContext, TProperties> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public abstract getInnerSystems(properties: TProperties): GameSystem<TContext>[];

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<TProperties> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        // TODO: this seems to cause issues with player target system defaults when the list includes both a card target and player target system
        // if we have an assigned target, overwrite the default target on all inner systems
        for (const gameSystem of this.getInnerSystems(properties)) {
            if (properties.target !== null && (!Array.isArray(properties.target) || properties.target.length !== 0)) {
                gameSystem.setDefaultTargetFn(() => properties.target);
            } else {
                gameSystem.setDefaultTargetFn(() => gameSystem.defaultTargets(context));
            }
        }

        return properties;
    }

    public abstract override hasLegalTarget(context: TContext, additionalProperties?: Partial<TProperties>, mustChangeGameState?: GameStateChangeRequired): boolean;

    public override isTargetSelective(context: TContext): boolean {
        return this.getInnerSystemsForIntrospection(context).some((gameSystem) => gameSystem.isTargetSelective(context));
    }

    public override getTargetTypeFilter(context: TContext): CardTypeFilter[] | null {
        const typeFilters = this.getInnerSystemsForIntrospection(context)
            .filter((gameSystem) => gameSystem.isTargetSelective(context))
            .flatMap((gameSystem) => Helpers.asArray(gameSystem.getTargetTypeFilter(context)));
        return typeFilters.length > 0 ? [...new Set(typeFilters)] : null;
    }

    /**
     * Returns the inner systems for introspection purposes (target selectivity, prompt descriptions) using the
     * raw static properties only. This avoids running {@link generatePropertiesFromContext}, which can be
     * expensive or have side effects (e.g. {@link RandomSelectionSystem} performs its random selection there),
     * and property factories, which may depend on not-yet-chosen targets.
     */
    private getInnerSystemsForIntrospection(context: TContext): GameSystem<TContext>[] {
        try {
            if (!this.properties) {
                return [];
            }
            return Helpers.asArray(this.getInnerSystems(this.properties)).filter((system) => system instanceof GameSystem);
        } catch (err) {
            context.game.reportError(err);
            return [];
        }
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }
}
