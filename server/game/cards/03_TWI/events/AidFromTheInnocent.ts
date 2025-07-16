import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, TargetMode } from '../../../core/Constants';

export default class AidFromTheInnocent extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7510418786',
            internalName: 'aid-from-the-innocent',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Search the top 10 cards of your deck for 2 Heroism non-unit cards and discard them. For this phase, you may play the discarded cards, and they each cost 2 less.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 2,
                searchCount: 10,
                cardCondition: (card) => !card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard()
                ])
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'For this phase, you may play the discarded cards for 2 less each',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                    ifYouDoContext.selectedPromptCards?.flatMap((target) => [
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            target: target,
                            effect: AbilityHelper.ongoingEffects.canPlayFromDiscard(),
                        }),
                        AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                            effect: AbilityHelper.ongoingEffects.decreaseCost({ amount: 2, match: (card) => card === target }),
                        })
                    ])
                )
            })
        });
    }
}
