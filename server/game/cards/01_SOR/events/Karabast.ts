import { EventCard } from '../../../core/card/EventCard';
import {
    RelativePlayer,
    WildcardCardType,
    WildcardZoneName
} from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class Karabast extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6515891401',
            internalName: 'karabast',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'A friendly unit deals damage equal to its damage plus one to an enemy unit.',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.damage + 1,
                        source: context.targets.friendlyUnit
                    })),
                }
            }
        });
    }
}

Karabast.implemented = true;
