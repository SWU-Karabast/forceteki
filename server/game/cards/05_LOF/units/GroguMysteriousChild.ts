import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class GroguMysteriousChild extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4389144613',
            internalName: 'grogu#mysterious-child',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Heal up to 2 damage from a unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 2,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal that much damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: ifYouDoContext.events[0].totalDistributed,
                    }),
                },
            })
        });
    }
}