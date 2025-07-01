import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class UnexpectedEscape extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1973545191',
            internalName: 'unexpected-escape',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Choose a unit to exhaust',
            targetResolvers: {
                exhaust: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                },
                rescue: {
                    dependsOn: 'exhaust',
                    // TODO: make activePromptTitle able to be a function so we can put the name of the capturing unit in the title
                    activePromptTitle: 'Rescue a captured card guarded by that unit',
                    optional: true,
                    zoneFilter: ZoneName.Capture,
                    capturedByFilter: (context) => context.targets['exhaust'],
                    immediateEffect: AbilityHelper.immediateEffects.rescue()
                }
            }
        });
    }
}
