import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class TakeCaptive extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3765912000',
            internalName: 'take-captive',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'A friendly unit captures an enemy non-leader unit in the same arena',
            targetResolvers: {
                friendlyUnit: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => card.zoneName === context.targets['friendlyUnit'].zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({ captor: context.targets['friendlyUnit'] }))
                }
            }
        });
    }
}

TakeCaptive.implemented = true;
