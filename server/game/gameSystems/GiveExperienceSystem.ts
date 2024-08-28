import { AbilityContext } from '../core/ability/AbilityContext';
import { TokenName } from '../core/Constants';
import { GiveTokenUpgradeSystem, IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';

export type IGiveExperienceProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveExperienceSystem extends GiveTokenUpgradeSystem {
    public override readonly name = 'give experience';
    protected override readonly defaultProperties: IGiveTokenUpgradeProperties = {
        amount: 1,
        tokenType: TokenName.Experience
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IGiveExperienceProperties | ((context?: AbilityContext) => IGiveExperienceProperties)) {
        let propertyWithTokenType: IGiveTokenUpgradeProperties | ((context?: AbilityContext) => IGiveTokenUpgradeProperties);

        if (typeof propertiesOrPropertyFactory === 'function') {
            propertyWithTokenType = (context?: AbilityContext) => Object.assign(propertiesOrPropertyFactory(context), { tokenType: TokenName.Experience });
        } else {
            propertyWithTokenType = Object.assign(propertiesOrPropertyFactory, { tokenType: TokenName.Experience });
        }

        super(propertyWithTokenType);
    }
}
