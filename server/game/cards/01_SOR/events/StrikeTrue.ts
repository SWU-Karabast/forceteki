import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName, Trait } from '../../../core/Constants';

export default class StrikeTrue extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1349057156',
            internalName: 'strike-true',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'A friendly unit deals damage equal to its power to an enemy unit',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit
                },
                damageTarget: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.getPower(),
                        source: context.targets.friendlyUnit
                    })),
                }
            }
        });
    }
}

StrikeTrue.implemented = true;