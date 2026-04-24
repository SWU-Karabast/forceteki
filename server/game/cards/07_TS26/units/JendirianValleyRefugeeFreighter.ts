import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JendirianValleyRefugeeFreighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1994755867',
            internalName: 'jendirian-valley#refugee-freighter',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 8 cards of your deck for a card and resource it',
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                selectCount: 1,
                searchCount: 8,
                canChooseFewer: false,
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.resourceCard()
            })
        });
    }
}