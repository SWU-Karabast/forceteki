import type { ITokenCard } from './propertyMixins/Token';
import { AsToken } from './propertyMixins/Token';
import type { INonLeaderUnitCard } from './NonLeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';
import type { IUpgradeCard } from './CardInterfaces';
import { InPlayCard } from './baseClasses/InPlayCard';
import { registerState } from '../GameObjectUtils';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);
const TokenCardParent = AsToken(InPlayCard);

export interface ITokenUpgradeCard extends ITokenCard, IUpgradeCard {}
export interface ITokenUnitCard extends ITokenCard, INonLeaderUnitCard {}

@registerState()
export class TokenUnitCard extends TokenUnitParent implements ITokenUnitCard {
    public declare state: never;

    public override isTokenUnit(): this is ITokenUnitCard {
        return true;
    }
}

@registerState()
export class TokenUpgradeCard extends TokenUpgradeParent implements ITokenUpgradeCard {
    public declare state: never;

    public override isTokenUpgrade(): this is ITokenUpgradeCard {
        return true;
    }
}

@registerState()
export class TokenCard extends TokenCardParent implements ITokenCard {
    public declare state: never;
}
