import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class ChooseSides extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2346145249',
            internalName: 'choose-sides'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a friendly non-leader unit and an enemy non-leader unit. Exchange control of those units.',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly non-leader unit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    activePromptTitle: 'Choose an enemy non-leader unit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            target: context.targets.friendlyUnit,
                            newController: context.targets.friendlyUnit.controller.opponent,
                        })),
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            target: context.targets.enemyUnit,
                            newController: context.targets.enemyUnit.controller.opponent,
                        })),
                    ])
                }
            }
        });
    }
}
