import type { ITokenCard } from './propertyMixins/Token';
import { AsToken } from './propertyMixins/Token';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';
import type { IUnitCard } from './propertyMixins/UnitProperties';
import type { IUpgradeCard } from '../../Interfaces';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);

export interface ITokenUpgradeCard extends ITokenCard, IUpgradeCard {}
export interface ITokenUnitCard extends ITokenCard, IUnitCard {}

export class TokenUnitCard extends TokenUnitParent implements ITokenUnitCard {
    public override isTokenUnit(): this is ITokenUnitCard {
        return true;
    }
}

export class TokenUpgradeCard extends TokenUpgradeParent implements ITokenUpgradeCard {
    public override isTokenUpgrade(): this is ITokenUpgradeCard {
        return true;
    }
}
