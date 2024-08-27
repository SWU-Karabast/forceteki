import { AsToken } from './propertyMixins/Token';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);

export class TokenBasicUnitCard extends TokenUnitParent {
}

export class TokenUpgradeCard extends TokenUpgradeParent {
}