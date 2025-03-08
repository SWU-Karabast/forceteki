import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class ThereIsNoEscape extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9184947464',
            internalName: 'there-is-no-escape',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose up to 3 units. Those units lose all abilities for this round.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities()
                })
            }
        });
    }
}
