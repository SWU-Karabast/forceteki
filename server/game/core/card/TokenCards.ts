import { AsToken } from './propertyMixins/Token';
import { NonLeaderUnitCardInternal } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';

const TokenUnitParent = AsToken(NonLeaderUnitCardInternal);
const TokenUpgradeParent = AsToken(UpgradeCard);

export class TokenUnitCard extends TokenUnitParent {
    protected override state: never;
}

export class TokenUpgradeCard extends TokenUpgradeParent {
    protected override state: never;
}