import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BraccaShipbreaker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bracca-shipbreaker-id',
            internalName: 'bracca-shipbreaker'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card from your deck',
            immediateEffect: abilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            }))
        });
    }
}