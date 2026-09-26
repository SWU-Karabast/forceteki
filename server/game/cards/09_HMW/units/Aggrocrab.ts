import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Aggrocrab extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2811497947',
            internalName: 'aggrocrab',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `While you have the initiative, this unit costs ${TextHelper.resource(1)} less to play`,
            condition: (context) => context.player.hasInitiative(),
            amount: 1,
        });
    }
}