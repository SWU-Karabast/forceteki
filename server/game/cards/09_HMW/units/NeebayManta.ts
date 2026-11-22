import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class NeebayManta extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8362464276',
            internalName: 'neebray-manta',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Draw 3 cards',
            immediateEffect: abilityHelper.immediateEffects.draw({ amount: 3 })
        });
    }
}