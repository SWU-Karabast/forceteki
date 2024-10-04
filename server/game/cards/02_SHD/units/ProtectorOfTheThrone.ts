import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ProtectorOfTheThrone extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9405733493',
            internalName: 'protector-of-the-throne',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'Gain sentinel while upgraded',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}

ProtectorOfTheThrone.implemented = true;
