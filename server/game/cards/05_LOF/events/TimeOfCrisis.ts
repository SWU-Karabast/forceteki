import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class TimeOfCrisis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0466077140',
            internalName: 'time-of-crisis',
        };
    }

    protected override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each player chooses a unit they control. Deal 3 damage to each unit not chosen this way',
            targetResolvers: {
                opponentChoice: {
                    choosingPlayer: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: 3,
                        target: context.player.opponent.getArenaUnits({ otherThan: context.targets.opponentChoice })
                    })),
                },
                selfChoice: {
                    choosingPlayer: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: 3,
                        target: context.player.getArenaUnits({ otherThan: context.targets.selfChoice })
                    })),
                }
            }
        });
    }
}