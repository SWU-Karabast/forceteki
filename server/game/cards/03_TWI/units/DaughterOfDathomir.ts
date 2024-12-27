import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class DaughterOfDathomir extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3420865217',
            internalName: 'daughter-of-dathomir'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While this unit is undamaged, it gains Restore 2',
            condition: (context) => context.source.damage === 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
        });
    }
}

DaughterOfDathomir.implemented = true;
