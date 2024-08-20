import AbilityHelper from '../../AbilityHelper';
import Card from '../../core/card/Card';
import { CardType, Location, RelativePlayer } from '../../core/Constants';

export default class DeathTrooper extends Card {
    protected override getImplementationId() {
        return {
            id: '6458912354',
            internalName: 'death-trooper'
        };
    }

    public override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Deal 2 damage to a friendly ground unit and an enemy ground unit',
            optional: false,
            targetResolvers: {
                myGroundUnit: {
                    cardType: CardType.Unit,
                    controller: RelativePlayer.Self,
                    locationFilter: Location.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                },
                theirGroundUnit: {
                    cardType: CardType.Unit,
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