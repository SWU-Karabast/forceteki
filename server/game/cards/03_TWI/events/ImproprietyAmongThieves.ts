import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { PhaseName, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class ImproprietyAmongThieves extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1302133998',
            internalName: 'impropriety-among-thieves'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a ready non-leader unit controlled by each player.',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly ready non-leader unit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => card.canBeExhausted() && !card.exhausted
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    activePromptTitle: 'Choose an enemy ready non-leader unit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => card.canBeExhausted() && !card.exhausted,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            target: context.targets.friendlyUnit,
                            newController: context.player.opponent,
                        })),
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            target: context.targets.enemyUnit,
                            newController: context.player,
                        })),
                        AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                            title: 'Owner takes control',
                            target: context.targets.friendlyUnit,
                            when: {
                                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                            },
                            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                                newController: context.targets.friendlyUnit.owner
                            })
                        })),
                        AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                            title: 'Owner takes control',
                            target: context.targets.enemyUnit,
                            when: {
                                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                            },
                            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                                newController: context.targets.enemyUnit.owner
                            })
                        }))
                    ]),
                }
            },
        });
    }
}
