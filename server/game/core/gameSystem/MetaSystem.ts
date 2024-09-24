import { AbilityContext } from '../ability/AbilityContext';
import { Card } from '../card/Card';
import { GameSystem, IGameSystemProperties } from './GameSystem';

/**
 * Meta-system used for executing a set of other systems together.
 *
 * @template TContext Type of {@link AbilityContext} that this system uses for any method that accepts a context
 */
export abstract class MetaSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IGameSystemProperties = IGameSystemProperties> extends GameSystem<TProperties> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}
}
