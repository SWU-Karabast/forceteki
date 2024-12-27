import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CriminalMuscle extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6475868209',
            internalName: 'criminal-muscle'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Return a non-unique upgrade to its owner\'s hand.',
            optional: true,
            targetResolver: {
                cardCondition: (card) => !card.unique,
                cardTypeFilter: WildcardCardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

CriminalMuscle.implemented = true;
