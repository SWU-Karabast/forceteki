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

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each player chooses a unit they control. Deal 3 damage to each unit not chosen this way',
            targetResolvers: {
                selfChoice: {
                    choosingPlayer: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self
                },
                opponentChoice: {
                    choosingPlayer: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Opponent
                }
            },
            then: (thenContext) => ({
                title: 'Deal 3 damage to each unit not chosen this way',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    amount: 3,
                    target: thenContext.game.getArenaUnits({ condition: (card) => card !== thenContext.targets.opponentChoice && card !== thenContext.targets.selfChoice })
                })
            })
        });
    }
}