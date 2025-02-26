import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class MakeAnOpening extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3208391441',
            internalName: 'make-an-opening',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Give a unit -2/-2 for this phase. Heal 2 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    innerSystem: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
                    }),
                }),
                AbilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.source.controller.base }))
            ])
        });
    }
}
