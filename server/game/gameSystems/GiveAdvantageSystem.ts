import type { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUpgradeName } from '../core/Constants';
import type { IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';
import { GiveTokenUpgradeSystem } from './GiveTokenUpgradeSystem';
import { ChatHelpers } from '../core/chat/ChatHelpers';

export type IGiveAdvantageProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveAdvantageSystem<TContext extends AbilityContext = AbilityContext> extends GiveTokenUpgradeSystem<TContext> {
    public override readonly name = 'give advantage';

    protected override getTokenType() {
        return TokenUpgradeName.Advantage;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['give {0} to {1}', [ChatHelpers.pluralize(properties.amount, 'an Advantage token', 'Advantage tokens'), this.getTargetMessage(properties.target, context)]];
    }
}
