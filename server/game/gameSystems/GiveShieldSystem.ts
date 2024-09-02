import { AbilityContext } from '../core/ability/AbilityContext';
import { TokenName } from '../core/Constants';
import { GiveTokenUpgradeSystem, IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';

export type IGiveShieldProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveShieldSystem extends GiveTokenUpgradeSystem {
    public override readonly name = 'give shield';
    protected override readonly defaultProperties: IGiveTokenUpgradeProperties = {
        amount: 1,
        tokenType: TokenName.Shield
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IGiveShieldProperties | ((context?: AbilityContext) => IGiveShieldProperties)) {
        let propertyWithTokenType: IGiveTokenUpgradeProperties | ((context?: AbilityContext) => IGiveTokenUpgradeProperties);

        if (typeof propertiesOrPropertyFactory === 'function') {
            propertyWithTokenType = (context?: AbilityContext) => Object.assign(propertiesOrPropertyFactory(context), { tokenType: TokenName.Shield });
        } else {
            propertyWithTokenType = Object.assign(propertiesOrPropertyFactory, { tokenType: TokenName.Shield });
        }

        super(propertyWithTokenType);
    }
}
