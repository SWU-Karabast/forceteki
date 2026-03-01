import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class GovernorsShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2268751344',
            internalName: 'governors-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Each player chooses a unit they control. Defeat those units.',
            targetResolvers: {
                opponentChoice: {
                    choosingPlayer: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.defeat()
                },
                selfChoice: {
                    choosingPlayer: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.defeat()
                }
            }
        });
    }
}