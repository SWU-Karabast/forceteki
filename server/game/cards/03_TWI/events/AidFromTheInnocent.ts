import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, RelativePlayer, TargetMode } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class AidFromTheInnocent extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7510418786',
            internalName: 'aid-from-the-innocent',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Search the top 10 cards of your deck for 2 ${TextHelper.Heroism} non-unit cards and discard them. For this phase, you may play the discarded cards, and they each cost ${TextHelper.resource(2)} less.`,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 2,
                searchCount: 10,
                cardCondition: (card) => !card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: `For this phase, you may play the discarded cards for ${TextHelper.resource(2)} less each`,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    target: ifYouDoContext.selectedPromptCards,
                    effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                        player: RelativePlayer.Self,
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 }
                    })
                })
            })
        });
    }
}
