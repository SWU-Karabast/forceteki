import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName } from '../../../core/Constants';

export default class CoruscantGuard extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7380773849',
            internalName: 'coruscant-guard',
        };
    }

    public override setupCardAbilities () {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Sentinel',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}

CoruscantGuard.implemented = true;
