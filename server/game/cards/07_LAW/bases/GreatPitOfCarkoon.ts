import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class GreatPitOfCarkoon extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'great-pit-of-carkoon-id',
            internalName: 'great-pit-of-carkoon',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Search your deck for a card named The Sarlacc of Carkoon, reveal it, and draw it',
            cost: AbilityHelper.costs.discardCardFromOwnHand({
                cardCondition: (card) => card.isUnit(),
            }),
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.entireDeckSearch({
                    cardCondition: (card) => card.name === 'The Sarlacc of Carkoon',
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard(),
                    revealSelected: true,
                    shuffleWhenDone: false,
                }),
                AbilityHelper.immediateEffects.shuffleDeck()
            ]),
        });
    }
}
