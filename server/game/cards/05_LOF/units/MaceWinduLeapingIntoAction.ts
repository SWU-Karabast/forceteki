import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class MaceWinduLeapingIntoAction extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9757688123',
            internalName: 'mace-windu#leaping-into-action'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use The Force to deal 4 damage to a unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Deal 4 damage to a unit',
                targetResolver: {
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 })
                }
            }
        });
    }
}