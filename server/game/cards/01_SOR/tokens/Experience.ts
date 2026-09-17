import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import { TokenUpgradeName } from '../../../core/Constants';

export default class Experience extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2007868442',
            internalName: 'experience',
        };
    }

    public override isExperience(): this is Experience {
        return true;
    }

    public override get tokenName(): TokenUpgradeName {
        return TokenUpgradeName.Experience;
    }
}
