import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class Equalize extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5013214638',
            internalName: 'equalize',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give a unit –2/–2 for this phase. Then, if you control fewer units than that unit\'s controller, give another unit –2/–2 for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                })
            },
            then: (thenContext) => ({
                title: 'Give another unit –2/–2 for this phase',
                thenCondition: (context) => context.source.controller.getUnitsInPlay().length < context.source.controller.opponent.getUnitsInPlay().length,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => thenContext.target !== card,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                    })
                }
            })
        });
    }
}
