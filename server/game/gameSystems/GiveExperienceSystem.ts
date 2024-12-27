import { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUpgradeName } from '../core/Constants';
import { GiveTokenUpgradeSystem, IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';

export type IGiveExperienceProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveExperienceSystem<TContext extends AbilityContext = AbilityContext> extends GiveTokenUpgradeSystem<TContext> {
    public override readonly name = 'give experience';

    protected override getTokenType() {
        return TokenUpgradeName.Experience;
    }
}
