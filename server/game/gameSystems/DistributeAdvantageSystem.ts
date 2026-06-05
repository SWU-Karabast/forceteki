import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { MetaEventName } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';
import { GiveAdvantageSystem } from './GiveAdvantageSystem';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';

export type IDistributeAdvantageSystemProperties<TContext extends AbilityContext = AbilityContext> = IDistributeAmongTargetsSystemProperties<TContext>;

/**
 * System for distributing Advantage tokens among target cards.
 * Will prompt the user to select where to put the Advantage tokens (unless auto-selecting a single target is possible).
 */
export class DistributeAdvantageSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    public override readonly eventName = MetaEventName.DistributeAdvantage;
    public override readonly name = 'distributeAdvantage';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeAdvantage;

    protected override generateEffectSystem(target: Card = null, amount = 1): GiveAdvantageSystem {
        return new GiveAdvantageSystem({ target, amount });
    }

    protected override canDistributeLessDefault(): boolean {
        return false;
    }

    protected override getDistributedAmountFromEvent(event: any): number {
        return event.amount;
    }

    protected override getDistributionType(amount: number): string | FormatMessage {
        return ChatHelpers.pluralize(amount, 'Advantage token', 'Advantage tokens');
    }

    protected override getDistributionVerb(): string {
        return 'give';
    }
}
