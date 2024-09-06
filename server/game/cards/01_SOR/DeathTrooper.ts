import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, WildcardCardType } from '../../core/Constants';

export default class DeathTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6458912354',
            internalName: 'death-trooper'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to a friendly ground unit and an enemy ground unit',
            targetResolvers: {
                myGroundUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    locationFilter: Location.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                },
                theirGroundUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    locationFilter: Location.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            },
            effect: 'deal 2 damage to {1} and {2}',
            effectArgs: (context) => [context.targets.myGroundUnit, context.targets.theirGroundUnit]
        });
    }
}

DeathTrooper.implemented = true;