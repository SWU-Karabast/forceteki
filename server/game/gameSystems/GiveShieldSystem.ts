import { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUpgradeName } from '../core/Constants';
import { GiveTokenUpgradeSystem, IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';

export type IGiveShieldProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveShieldSystem<TContext extends AbilityContext = AbilityContext> extends GiveTokenUpgradeSystem<TContext> {
    public override readonly name = 'give shield';

    protected override getTokenType() {
        return TokenUpgradeName.Shield;
    }
}
