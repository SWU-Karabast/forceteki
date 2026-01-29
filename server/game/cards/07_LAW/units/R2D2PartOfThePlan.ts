import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class R2D2PartOfThePlan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8106453944',
            internalName: 'r2d2#part-of-the-plan',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for a unit that shares an aspect with a friendly unit, reveal it, and draw it',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card, context) => card.isUnit() && context.player.isAspectInPlay([...card.aspects]),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}