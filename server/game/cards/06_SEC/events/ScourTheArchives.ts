import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class ScourTheArchives extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5396248950',
            internalName: 'scour-the-archives'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Search the top 8 cards of your deck for an Upgrade, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                cardCondition: (card) => card.isUpgrade(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}