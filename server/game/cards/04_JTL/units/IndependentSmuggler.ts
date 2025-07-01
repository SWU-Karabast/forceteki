import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class IndependentSmuggler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0587196584',
            internalName: 'independent-smuggler',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addPilotingConstantAbilityTargetingAttached({
            title: 'Attached unit gains Raid 1',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
