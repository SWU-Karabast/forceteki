import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class InsurgentSaboteurs extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3310100725',
            internalName: 'insurgent-saboteurs',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Defeat an upgrade',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
        });
    }
}