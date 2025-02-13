import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DamageType, MetaEventName } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import { DamageSystem } from './DamageSystem';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';
import type { HealSystem } from './HealSystem';

export interface IDistributeDamageSystemProperties<TContext extends AbilityContext = AbilityContext> extends IDistributeAmongTargetsSystemProperties<TContext> {

    /** The source of the damage, if different from the card that triggered the ability */
    source?: Card;
}

/**
 * System for distributing damage among target cards.
 * Will prompt the user to select where to put the damage (unless auto-selecting a single target is possible).
 */
export class DistributeDamageSystem<
    TContext extends AbilityContext = AbilityContext,
    TProperties extends IDistributeDamageSystemProperties<TContext> = IDistributeDamageSystemProperties<TContext>
> extends DistributeAmongTargetsSystem<TContext, TProperties> {
    protected override readonly eventName = MetaEventName.DistributeDamage;
    public override readonly name = 'distributeDamage';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeDamage;

    protected override generateEffectSystem(target: Card = null, amount = 1): DamageSystem | HealSystem {
        const { source } = this.properties;
        return new DamageSystem({ type: DamageType.Ability, target, amount, source });
    }

    // most "distribute damage" abilities require all damage to be dealt
    protected override canDistributeLessDefault(): boolean {
        return false;
    }

    protected override getDistributedAmountFromEvent(event: any): number {
        return event.damageDealt;
    }
}
