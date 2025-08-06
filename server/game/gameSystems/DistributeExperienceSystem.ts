import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { MetaEventName } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';
import { GiveExperienceSystem } from './GiveExperienceSystem';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';

export type IDistributeExperienceSystemProperties<TContext extends AbilityContext = AbilityContext> = IDistributeAmongTargetsSystemProperties<TContext>;

/**
 * System for distributing experience among target cards.
 * Will prompt the user to select where to put the experience (unless auto-selecting a single target is possible).
 */
export class DistributeExperienceSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    public override readonly eventName = MetaEventName.DistributeExperience;
    public override readonly name = 'distributeExperience';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeExperience;

    protected override generateEffectSystem(target: Card = null, amount = 1): GiveExperienceSystem {
        return new GiveExperienceSystem({ target, amount });
    }

    protected override canDistributeLessDefault(): boolean {
        return false;
    }

    protected override getDistributedAmountFromEvent(event: any): number {
        return event.amount;
    }

    protected override getDistributionType(amount: number): string | FormatMessage {
        return ChatHelpers.pluralize(amount, 'Experience token', 'Experience tokens');
    }

    protected override getDistributionVerb(): string {
        return 'give';
    }
}
