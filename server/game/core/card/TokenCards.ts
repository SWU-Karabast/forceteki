import type { ITokenCard } from './propertyMixins/Token';
import { AsToken } from './propertyMixins/Token';
import type { INonLeaderUnitCard } from './NonLeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';
import type { IUpgradeCard } from './CardInterfaces';
import { InPlayCard } from './baseClasses/InPlayCard';
import type { TokenUpgradeName } from '../Constants';
import { CardType } from '../Constants';
import { registerStateBase } from '../GameObjectUtils';
import { Contract } from '../utils/Contract';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);
const TokenCardParent = AsToken(InPlayCard);

export interface ITokenUpgradeCard extends ITokenCard, IUpgradeCard {

    /** Which kind of token upgrade this is, e.g. for giving another of the same kind. */
    readonly tokenName: TokenUpgradeName;
}
export interface ITokenUnitCard extends ITokenCard, INonLeaderUnitCard {}

@registerStateBase()
export class TokenUnitCard extends TokenUnitParent implements ITokenUnitCard {
    public declare state: never;

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

@registerStateBase()
export class TokenUpgradeCard extends TokenUpgradeParent implements ITokenUpgradeCard {
    public declare state: never;

    public override isTokenUpgrade(): this is ITokenUpgradeCard {
        return true;
    }

    /**
     * Each concrete token upgrade class overrides this with its TokenUpgradeName. Kept
     * separate from internalName on purpose: that is kebab-case card data, whereas the
     * enum is the key used for generating tokens, and the two need not stay aligned.
     */
    public get tokenName(): TokenUpgradeName {
        return Contract.fail(`Token upgrade '${this.internalName}' does not declare its TokenUpgradeName`);
    }
}

@registerStateBase()
export class TokenCard extends TokenCardParent implements ITokenCard {
    public declare state: never;
}
