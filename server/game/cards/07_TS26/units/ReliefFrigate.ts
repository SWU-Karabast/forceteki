import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class ReliefFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'relief-frigate-id',
            internalName: 'relief-frigate',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenPlayedAbility({
            title: 'Heal 3 damage from a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 3 })
            }
        });
    }
}