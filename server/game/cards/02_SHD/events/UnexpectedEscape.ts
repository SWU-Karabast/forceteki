import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class UnexpectedEscape extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1973545191',
            internalName: 'unexpected-escape',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a unit. You may rescue a captured card guarded by that unit.',
            targetResolvers: {
                exhaust: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                },
                rescue: {
                    dependsOn: 'exhaust',
                    activePromptTitle: 'Rescue a captured card guarded by that unit',
                    optional: true,
                    zoneFilter: [],
                    unitsCapturedBy: (context) => context.targets['exhaust'],
                    immediateEffect: AbilityHelper.immediateEffects.rescue()
                }
            }
        });
    }
}

UnexpectedEscape.implemented = true;
