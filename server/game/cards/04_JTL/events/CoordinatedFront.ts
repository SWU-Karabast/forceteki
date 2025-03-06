import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class CoordinatedFront extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9595202461',
            internalName: 'coordinated-front',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give a ground unit and a space unit +2/+2 for this phase',
            targetResolvers: {
                groundUnit: {
                    activePromptTitle: 'Give a ground unit +2/+2 for this phase',
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    })
                },
                spaceUnit: {
                    activePromptTitle: 'Give a space unit +2/+2 for this phase',
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.SpaceArena,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    })
                },
            },
        });
    }
}
