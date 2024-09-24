import { AbilityContext } from '../core/ability/AbilityContext';
import { TokenName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import { GiveTokenUpgradeSystem, IGiveTokenUpgradeProperties } from './GiveTokenUpgradeSystem';

export type IGiveExperienceProperties = Omit<IGiveTokenUpgradeProperties, 'tokenType'>;

export class GiveExperienceSystem<TContext extends AbilityContext = AbilityContext> extends GiveTokenUpgradeSystem<TContext> {
    public override readonly name = 'give experience';
    protected override readonly defaultProperties: IGiveTokenUpgradeProperties = {
        amount: 1,
        tokenType: TokenName.Experience
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IGiveExperienceProperties | ((context?: AbilityContext) => IGiveExperienceProperties)) {
        const propsWithTokenType = GameSystem.appendToPropertiesOrPropertyFactory<IGiveTokenUpgradeProperties, 'tokenType'>(propertiesOrPropertyFactory, { tokenType: TokenName.Experience });
        super(propsWithTokenType);
    }
}
