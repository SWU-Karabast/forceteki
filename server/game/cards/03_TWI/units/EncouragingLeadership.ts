import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardZoneName } from '../../../core/Constants';

export default class EncouragingLeadership extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4916334670',
            internalName: 'encouraging-leadership'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give each friendly unit +1/+1 for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.isUnit()),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
            })),
        });
    }
}

EncouragingLeadership.implemented = true;