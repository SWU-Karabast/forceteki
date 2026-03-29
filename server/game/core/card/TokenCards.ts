import type { ITokenCard } from './propertyMixins/Token';
import { AsToken } from './propertyMixins/Token';
import type { INonLeaderUnitCard } from './NonLeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';
import type { IUpgradeCard } from './CardInterfaces';
import { InPlayCard } from './baseClasses/InPlayCard';
import { CardType } from '../Constants';
import { registerState } from '../GameObjectUtils';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);
const TokenCardParent = AsToken(InPlayCard);

export interface ITokenUpgradeCard extends ITokenCard, IUpgradeCard {}
export interface ITokenUnitCard extends ITokenCard, INonLeaderUnitCard {}

@registerState({ autoInitialize: false })
export class TokenUnitCard extends TokenUnitParent implements ITokenUnitCard {
    public override isTokenUnit(): this is ITokenUnitCard {
        return true;
    }

    protected override getType(): CardType {
        if (this.isLeaderAttachedToThis()) {
            return CardType.TokenLeaderUnit;
        }
        return super.getType();
    }
}

@registerState({ autoInitialize: false })
export class TokenUpgradeCard extends TokenUpgradeParent implements ITokenUpgradeCard {
    public override isTokenUpgrade(): this is ITokenUpgradeCard {
        return true;
    }
}

@registerState({ autoInitialize: false })
export class TokenCard extends TokenCardParent implements ITokenCard {
}
