import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { TokenUpgradeName } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';
import { GiveTokenUpgradeSystem } from './GiveTokenUpgradeSystem';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import type { FormatMessage } from '../core/chat/GameChat';

export interface IDistributeTokenUpgradeSystemProperties<TContext extends AbilityContext = AbilityContext> extends IDistributeAmongTargetsSystemProperties<TContext> {
    tokenType: TokenUpgradeName;
}

/**
 * System for distributing token upgrades (Experience, Advantage) among target cards. The specific token is set via
 * `tokenType` (see the distribute*Among factory methods in GameSystemLibrary).
 * Will prompt the user to select where to put the tokens (unless auto-selecting a single target is possible).
 */
export class DistributeTokenUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext, IDistributeTokenUpgradeSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.DistributeTokenUpgrade;
    public override readonly name = 'distributeTokenUpgrade';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeTokenUpgrade;

    protected override generateEffectSystem(target: Card = null, amount = 1, properties?: IDistributeTokenUpgradeSystemProperties<TContext>): GiveTokenUpgradeSystem {
        return new GiveTokenUpgradeSystem({ target, amount, tokenType: properties.tokenType });
    }

    protected override canDistributeLessDefault(): boolean {
        return false;
    }

    protected override getDistributedAmountFromEvent(event: any): number {
        return event.amount;
    }

    protected override getDistributionType(amount: number, context: TContext): string | FormatMessage {
        const tokenTitle = EnumHelpers.tokenTitle[this.generatePropertiesFromContext(context).tokenType];
        return ChatHelpers.pluralize(amount, `${tokenTitle} token`, `${tokenTitle} tokens`);
    }

    protected override getDistributionVerb(): string {
        return 'give';
    }

    protected override getPromptTokenType(context: TContext): TokenUpgradeName {
        return this.generatePropertiesFromContext(context).tokenType;
    }
}
