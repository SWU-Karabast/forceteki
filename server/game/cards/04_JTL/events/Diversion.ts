import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class Diversion extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7214707216',
            internalName: 'diversion',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Give a unit Sentinel for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                })
            }
        });
    }
}
