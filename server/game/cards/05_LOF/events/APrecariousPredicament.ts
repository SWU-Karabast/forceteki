import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { PlayType, RelativePlayer, TargetMode, WildcardCardType, WildcardRelativePlayer, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class APrecariousPredicament extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'a-precarious-predicament-id',
            internalName: 'a-precarious-predicament',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return an enemy non-leader unit to its owner\'s hand unless its controller says, “It could be worse”. If they do, you may play a card named It\'s Worse from your hand or resources for free',
            targetResolvers: {
                targetUnit: {
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit
                },
                opponentsChoice: {
                    mode: TargetMode.Select,
                    dependsOn: 'targetUnit',
                    choosingPlayer: RelativePlayer.Opponent,
                    showUnresolvable: true,
                    choices: (context) => ({
                        [`Return ${context.targets.targetUnit.title} to ${context.targets.targetUnit.owner === context.player ? 'opponent\'s' : 'your'} hand`]: AbilityHelper.immediateEffects.returnToHand({
                            target: context.targets.targetUnit,
                        }),
                        ['Opponent can play It\'s Worse from their hand or resources for free']: AbilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Self,
                            zoneFilter: [ZoneName.Hand, ZoneName.Resource],
                            cardCondition: (card) => card.title === 'It\'s Worse',
                            innerSystem: AbilityHelper.immediateEffects.playCard((context) => ({
                                adjustCost: { costAdjustType: CostAdjustType.Free },
                                playAsType: WildcardCardType.Any,
                                canPlayFromAnyZone: true,
                                playType: context.target?.zoneName === ZoneName.Resource ? PlayType.PlayFromOutOfPlay : PlayType.PlayFromHand,
                            })),
                        })
                    })
                }
            }
        });
    }
}
