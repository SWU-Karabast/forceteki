import type { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUpgradeName } from '../core/Constants';
import type { IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';
import { GiveTokenUpgradeSystem } from './GiveTokenUpgradeSystem';

export type IGiveExperienceProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveExperienceSystem<TContext extends AbilityContext = AbilityContext> extends GiveTokenUpgradeSystem<TContext> {
    public override readonly name = 'give experience';

    protected override getTokenType() {
        return TokenUpgradeName.Experience;
    }
}
