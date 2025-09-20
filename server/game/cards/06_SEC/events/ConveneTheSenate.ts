import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, Trait } from '../../../core/Constants';

export default class ConveneTheSenate extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'convene-the-senate-id',
            internalName: 'convene-the-senate',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Search the top 8 cards of your deck for up to 2 Official units, reveal them, and draw them. Create a Spy token',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.createSpy(),
                abilityHelper.immediateEffects.deckSearch({
                    targetMode: TargetMode.UpTo,
                    selectCount: 2,
                    searchCount: 8,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Official),
                    selectedCardsImmediateEffect: abilityHelper.immediateEffects.drawSpecificCard()
                })
            ])
        });
    }
}