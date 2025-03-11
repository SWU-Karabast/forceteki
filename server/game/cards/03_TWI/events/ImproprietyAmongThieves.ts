import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { PhaseName, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

export default class ImproprietyAmongThieves extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1302133998',
            internalName: 'impropriety-among-thieves'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a ready non-leader unit controlled by each player. ',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a ready friendly non-leader unit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card: IUnitCard) => !card.isExhausted(),
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    activePromptTitle: 'Choose a ready enemy non-leader unit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card: IUnitCard) => !card.isExhausted(),
                }
            },
            ifYouDo: {
                title: 'Each player takes control of the chosen unit controlled by the player to their right. At the start of the regroup phase, each player takes control of each unit they own that was chosen for this ability.',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        target: context.targets.friendlyUnit,
                        newController: context.targets.friendlyUnit.controller.opponent,
                    })),
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        target: context.targets.enemyUnit,
                        newController: context.targets.enemyUnit.controller.opponent,
                    })),
                    AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                        title: 'Owner takes control',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                            target: context.targets.friendlyUnit,
                            newController: context.targets.friendlyUnit.controller.opponent,
                        }),
                    })),
                    AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                        title: 'Owner takes control',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                            target: context.targets.enemyUnit,
                            newController: context.targets.enemyUnit.controller.opponent,
                        }),
                    }))
                ]),
            }
        });
    }
}
