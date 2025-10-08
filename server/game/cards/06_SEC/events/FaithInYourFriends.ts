import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class FaithInYourFriends extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'faith-in-your-friends-id',
            internalName: 'faith-in-your-friends',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Cunning, Aspect.Cunning, Aspect.Cunning, Aspect.Heroism, Aspect.Heroism];
        registrar.setEventAbility({
            title: 'Search the top 3 cards of your deck for a card and draw it',
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                searchCount: 3,
                selectCount: 1,
                revealSelected: false,
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.drawSpecificCard()
            }),
            then: {
                title: `Disclose ${EnumHelpers.aspectString(aspects)} to create 2 Spy tokens`,
                immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
                ifYouDo: {
                    title: 'Create 2 Spy tokens',
                    immediateEffect: abilityHelper.immediateEffects.createSpy({ amount: 2 })
                }
            }
        });
    }
}