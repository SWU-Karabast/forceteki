import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class FugitiveWookiee extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6947306017',
            internalName: 'fugitive-wookiee',
        };
    }

    public override setupCardAbilities() {
        this.addBountyAbility({
            title: 'Exhaust a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

FugitiveWookiee.implemented = true;
