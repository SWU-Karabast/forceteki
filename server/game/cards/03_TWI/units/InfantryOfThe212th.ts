import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName } from '../../../core/Constants';

export default class InfantryOfThe212th extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4179773207',
            internalName: 'infantry-of-the-212th'
        };
    }

    public override setupCardAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Sentinel',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}

InfantryOfThe212th.implemented = true;