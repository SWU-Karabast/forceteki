import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ForceSlow extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7030628730',
            internalName: 'force-slow',
        };
    }

    protected override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give an exhausted unit -8/-0 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.canBeExhausted() && card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -8, hp: 0 }),
                }),
            }
        });
    }
}