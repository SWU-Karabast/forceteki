import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect } from '../../../core/Constants';

export default class PuttingATeamTogether extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'putting-a-team-together-id',
            internalName: 'putting-a-team-together',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Search the top 8 cards of your Vigilance, Aggression, or Cunning unit, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect([Aspect.Vigilance, Aspect.Aggression, Aspect.Cunning]),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}