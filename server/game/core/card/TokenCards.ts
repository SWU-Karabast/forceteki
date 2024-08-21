import { AsToken } from './propertyMixins/Token';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(NonLeaderUnitCard);

export class TokenNonLeaderUnitCard extends TokenUnitParent {
}

export class TokenUpgradeCard extends TokenUpgradeParent {
}