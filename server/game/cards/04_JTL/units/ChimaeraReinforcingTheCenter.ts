import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class ChimaeraReinforcingTheCenter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5184505570',
            internalName: 'chimaera#reinforcing-the-center'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Create 2 TIE Fighters',
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter({ amount: 2 })
        });

        this.addWhenPlayedAbility({
            title: 'Use a When Defeated ability on another unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => card !== context.source && card.canRegisterTriggeredAbilities() && card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated),
                immediateEffect: AbilityHelper.immediateEffects.useWhenDefeatedAbility()
            }
        });
    }
}