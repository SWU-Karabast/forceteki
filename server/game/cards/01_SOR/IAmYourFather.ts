import AbilityHelper from '../../AbilityHelper';
import { EventCard } from '../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../core/Constants';

export default class IAmYourFather extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0523973552',
            internalName: 'i-am-your-father',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 7 damage to an enemy unit unless its controller says "no"',
            targetResolvers: {
                targetUnit: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit
                },
                opponentsChoice: {
                    mode: TargetMode.Select,
                    dependsOn: 'targetUnit',
                    choosingPlayer: RelativePlayer.Opponent,
                    choices: (context) => ({
                        [`Let ${context.targets.targetUnit.title} take 7 damage`]: AbilityHelper.immediateEffects.damage({
                            target: context.targets.targetUnit,
                            amount: 7
                        }),
                        ['Let opponent draw 3 cards']: AbilityHelper.immediateEffects.draw({ amount: 3 })
                    })
                }
            }
        });
    }
}

IAmYourFather.implemented = true;
