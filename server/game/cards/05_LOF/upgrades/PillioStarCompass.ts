import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class PillioStarCompass extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8580514429',
            internalName: 'pillio-star-compass',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Search the top 3 cards of your deck for a unit, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                selectCount: 1,
                searchCount: 3,
                cardCondition: (card) => card.isUnit(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            }),
        });
    }
}