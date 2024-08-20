import { Token } from './propertyMixins/Token';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';

const TokenUnitParent = Token(NonLeaderUnitCard);
const TokenUpgradeParent = Token(NonLeaderUnitCard);

export class TokenNonLeaderUnitCard extends TokenUnitParent {
}

export class TokenUpgradeCard extends TokenUpgradeParent {
}