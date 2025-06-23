import type { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUpgradeName } from '../core/Constants';
import type { IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';
import { GiveTokenUpgradeSystem } from './GiveTokenUpgradeSystem';
import * as ChatHelpers from '../core/chat/ChatHelpers';

export type IGiveExperienceProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveExperienceSystem<TContext extends AbilityContext = AbilityContext> extends GiveTokenUpgradeSystem<TContext> {
    public override readonly name = 'give experience';

    protected override getTokenType() {
        return TokenUpgradeName.Experience;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        return ['give {0} to {1}', [ChatHelpers.pluralize(properties.amount, 'an Experience token', 'Experience tokens'), this.getTargetMessage(properties.target, context)]];
    }
}
