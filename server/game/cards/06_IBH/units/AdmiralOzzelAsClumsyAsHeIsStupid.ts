import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class AdmiralOzzelAsClumsyAsHeIsStupid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2022483509',
            internalName: 'admiral-ozzel#as-clumsy-as-he-is-stupid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Each opponent discards a card from their hand',
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({ target: context.player.opponent, amount: 1 })),
        });
    }
}