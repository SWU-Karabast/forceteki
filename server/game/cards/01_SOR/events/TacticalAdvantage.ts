import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TacticalAdvantage extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2651321164',
            internalName: 'tactical-advantage',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Give a unit +2/+2 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}

TacticalAdvantage.implemented = true;
