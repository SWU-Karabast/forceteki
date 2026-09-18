import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class TrustYourself extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8889497602',
            internalName: 'trust-yourself',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a Shield token to a unit. Search the top 3 cards of your deck for a card and draw it.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give a Shield token to a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }),
                AbilityHelper.immediateEffects.deckSearch({
                    activePromptTitle: 'Select a card',
                    searchCount: 3,
                    selectCount: 1,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            ])
        });
    }
}