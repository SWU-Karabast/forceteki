import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class NowThereAreTwoOfThem extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6849037019',
            internalName: 'now-there-are-two-of-them'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'If you control exactly one unit, play a non-Vehicle unit from your hand that shares a Trait with the unit you control. It costs 5 less.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getArenaUnits().length === 1,
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Play a non-Vehicle unit from your hand that shared a Trait with the unit you control. It costs 5 less.',
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card, context) =>
                        !card.hasSomeTrait(Trait.Vehicle) &&
                        Array.from(context.player.getArenaUnits()[0].traits).some((trait) => card.hasSomeTrait(trait)),
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 5 },
                        playAsType: WildcardCardType.Unit,
                    })
                }),
            })
        });
    }
}
