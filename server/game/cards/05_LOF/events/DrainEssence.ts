import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class DrainEssence extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'temp-drain-essence-id',
            internalName: 'drain-essence'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 2 damage to a unit. The Force is with you.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Select a unit to deal 2 damage to',
                    controller: WildcardRelativePlayer.Any,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }),
                AbilityHelper.immediateEffects.theForceIsWithYou()
            ])
        });
    }
}