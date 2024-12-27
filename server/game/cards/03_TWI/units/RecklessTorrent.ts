import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class RecklessTorrent extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2298508689',
            internalName: 'reckless-torrent',
        };
    }

    public override setupCardAbilities () {
        this.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Deal 2 damage to a friendly unit and 2 damage to an enemy unit in the same arena',
            when: {
                onCardPlayed: (event, context) => event.card === context.source
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

RecklessTorrent.implemented = true;
