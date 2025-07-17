import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class MercilessContest extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4412828936',
            internalName: 'merciless-contest',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each player chooses a non-leader unit they control. Defeat those units.',
            targetResolvers: {
                opponentChoice: {
                    choosingPlayer: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                },
                selfChoice: {
                    choosingPlayer: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }
            }
        });
    }
}
