import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class UndercityHuntingTeam extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3046952481',
            internalName: 'undercity-hunting-team',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 5 cards of you deck for a Bounty Hunter unit, reveal it, and draw it',
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.BountyHunter),
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}