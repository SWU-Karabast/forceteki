import { Token } from './propertyMixins/Token';
import { UnitCard } from './UnitCard';

const TokenUnitParent = Token(UnitCard);
const TokenUpgradeParent = Token(UnitCard);

export class TokenUnitCard extends TokenUnitParent {
}

export class TokenUpgradeCard extends TokenUpgradeParent {
}