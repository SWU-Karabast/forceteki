import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class SyndicateSpiceRunner extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1895232319',
            internalName: 'syndicate-spice-runner'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 3 cards of your deck for an Underworld unit, reveal it, and draw it',
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                searchCount: 3,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Underworld),
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}