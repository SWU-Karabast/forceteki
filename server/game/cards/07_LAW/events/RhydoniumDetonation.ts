import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class RhydoniumDetonation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9032736769',
            internalName: 'rhydonium-detonation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Each player may return a non-leader unit to its owner\'s hand',
            targetResolvers: {
                selfChoice: {
                    choosingPlayer: RelativePlayer.Self,
                    optional: true,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                },
                opponentChoice: {
                    choosingPlayer: RelativePlayer.Opponent,
                    optional: true,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                }
            },
            then: {
                title: 'Defeat all non-leader units',
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.game.getArenaUnits({
                        condition: (card) => card.isNonLeaderUnit()
                    })
                }))
            }
        });
    }
}