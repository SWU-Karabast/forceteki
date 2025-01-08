import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DamageType, MetaEventName } from '../core/Constants';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import { DamageSystem } from './DamageSystem';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';
import type { HealSystem } from './HealSystem';

export type IDistributeDamageSystemProperties<TContext extends AbilityContext = AbilityContext> = IDistributeAmongTargetsSystemProperties<TContext>;

/**
 * System for distributing damage among target cards.
 * Will prompt the user to select where to put the damage (unless auto-selecting a single target is possible).
 */
export class DistributeDamageSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    protected override readonly eventName = MetaEventName.DistributeDamage;
    public override readonly name = 'distributeDamage';

    public override promptType = StatefulPromptType.DistributeDamage;

    protected override generateEffectSystem(target: Card = null, amount = 1): DamageSystem | HealSystem {
        return new DamageSystem({ type: DamageType.Ability, target, amount });
    }

    // most "distribute damage" abilities require all damage to be dealt
    protected override canDistributeLessDefault(): boolean {
        return false;
    }
}
