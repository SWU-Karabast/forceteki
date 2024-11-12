import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class WantedInsurgents extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8679638018',
            internalName: 'wanted-insurgents',
        };
    }

    public override setupCardAbilities() {
        this.addBountyAbility({
            title: 'Deal 2 damage to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}

WantedInsurgents.implemented = true;
