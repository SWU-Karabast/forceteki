import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DQarCargoFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5422802110',
            internalName: 'dqar-cargo-frigate',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit gets -1/-0 for each damage on it.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: -(target.damage), hp: 0
            }))
        });
    }
}