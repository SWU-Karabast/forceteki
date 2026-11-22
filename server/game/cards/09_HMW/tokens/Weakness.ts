import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import { TokenUpgradeName } from '../../../core/Constants';

export default class Weakness extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7816991190',
            internalName: 'weakness',
        };
    }

    public override isWeakness(): this is Weakness {
        return true;
    }

    public override get tokenName(): TokenUpgradeName {
        return TokenUpgradeName.Weakness;
    }
}
