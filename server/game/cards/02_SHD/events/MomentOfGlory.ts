import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class MomentOfGlory extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1701265931',
            internalName: 'moment-of-glory',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give a unit +4/+4 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 4 })
                })
            }
        });
    }
}

MomentOfGlory.implemented = true;
