import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class UnityOfPurpose extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0753707056',
            internalName: 'unity-of-purpose',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'For each friendly unit with a different name, give each unit you control +1/+1 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => {
                const differentNameCount = new Set(context.player.getArenaUnits().map((x) => x.title)).size;
                return {
                    effect: AbilityHelper.ongoingEffects.modifyStats({
                        power: differentNameCount,
                        hp: differentNameCount
                    }),
                    target: context.player.getArenaUnits(),
                };
            })
        });
    }
}
