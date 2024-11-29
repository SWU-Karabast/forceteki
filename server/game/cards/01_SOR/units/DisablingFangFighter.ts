import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class DisablingFangFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2668056720',
            internalName: 'disabling-fang-fighter'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Defeat an upgrade.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

DisablingFangFighter.implemented = true;
