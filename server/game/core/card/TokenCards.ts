import type { ITokenCard } from './propertyMixins/Token';
import { AsToken } from './propertyMixins/Token';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import type { IUpgradeCard } from './UpgradeCard';
import { UpgradeCard } from './UpgradeCard';
import type { IUnitCard } from './propertyMixins/UnitProperties';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);

export interface ITokenUpgradeCard extends ITokenCard, IUpgradeCard {}
export interface ITokenUnitCard extends ITokenCard, IUnitCard {}

export class TokenUnitCard extends TokenUnitParent implements ITokenUnitCard {
}

export class TokenUpgradeCard extends TokenUpgradeParent implements ITokenUpgradeCard {
}
