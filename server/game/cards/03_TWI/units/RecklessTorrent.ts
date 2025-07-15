import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RecklessTorrent extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2298508689',
            internalName: 'reckless-torrent',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Deal 2 damage to a friendly unit and 2 damage to an enemy unit in the same arena',
            when: {
                whenPlayed: true,
            },
            targetResolvers: {
                friendlyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                },
                enemyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => (
                        context.targets.friendlyUnit
                            ? card.zoneName === context.targets.friendlyUnit.zoneName
                            : true
                    ),
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                }
            },
        });
    }
}
