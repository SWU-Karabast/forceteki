import { AbilityContext } from '../core/ability/AbilityContext';
import { MetaEventName } from '../core/Constants';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import { DistributeAmongTargetsSystem, IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { HealSystem } from './HealSystem';

export type IDistributeHealingSystemProperties<TContext extends AbilityContext = AbilityContext> = IDistributeAmongTargetsSystemProperties<TContext>;

/**
 * System for distributing healing among target cards.
 * Will prompt the user to select where to put the healing (unless auto-selecting a single target is possible).
 */
export class DistributeHealingSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    protected override readonly eventName = MetaEventName.DistributeHealing;
    public override readonly name = 'distributeHealing';

    public override promptType = StatefulPromptType.DistributeHealing;

    protected override generateEffectSystem(amount = 1): HealSystem {
        return new HealSystem({ amount });
    }

    // most "distribute healing" abilities do not require all healing to be dealt
    protected override canDistributeLessDefault(): boolean {
        return true;
    }
}
