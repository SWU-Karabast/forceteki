import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';

export default class OwenLarsDevotedUncle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5264998537',
            internalName: 'owen-lars#devoted-uncle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Search the top 5 of your deck for a Force unit then reveal it and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}