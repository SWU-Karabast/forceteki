import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { MetaEventName } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';
import { HealSystem } from './HealSystem';

export type IDistributeHealingSystemProperties<TContext extends AbilityContext = AbilityContext> = IDistributeAmongTargetsSystemProperties<TContext>;

/**
 * System for distributing healing among target cards.
 * Will prompt the user to select where to put the healing (unless auto-selecting a single target is possible).
 */
export class DistributeHealingSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    public override readonly eventName = MetaEventName.DistributeHealing;
    public override readonly name = 'distributeHealing';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeHealing;

    protected override generateEffectSystem(target: Card = null, amount = 1): HealSystem {
        return new HealSystem({ target, amount });
    }

    // most "distribute healing" abilities do not require all healing to be dealt
    protected override canDistributeLessDefault(): boolean {
        return true;
    }

    protected override getDistributedAmountFromEvent(event: any): number {
        return event.damageHealed;
    }

    protected override getDistributionType(): string {
        return 'healing';
    }
}
