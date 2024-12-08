import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class InPursuit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6401761275',
            internalName: 'in-pursuit'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, exhaust an enemy unit.',
            optional: true,
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly unit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    activePromptTitle: 'Choose an enemy unit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.exhaust((context) => ({
                            target: context.targets.friendlyUnit
                        })),
                        AbilityHelper.immediateEffects.exhaust((context) => ({
                            target: context.targets.enemyUnit
                        })),
                    ])
                }
            }
        });
    }
}

InPursuit.implemented = true;
