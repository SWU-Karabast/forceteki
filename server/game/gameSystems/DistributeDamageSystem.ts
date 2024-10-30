import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { EventName, MetaEventName } from '../core/Constants';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import { GameSystem } from '../core/gameSystem/GameSystem';
import { DamageSystem } from './DamageSystem';
import { DistributeAmongTargetsSystem, IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { HealSystem } from './HealSystem';

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
        return new DamageSystem({ target, amount });
    }

    // most "distribute damage" abilities require all damage to be dealt
    protected override canDistributeLessDefault(): boolean {
        return false;
    }
}
