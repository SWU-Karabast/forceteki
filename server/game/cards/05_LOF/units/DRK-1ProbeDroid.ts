import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class DRK1ProbeDroid extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1093502388',
            internalName: 'drk1-probe-droid'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Defeat an upgrade.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => !card.unique && card.isUpgrade(),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}