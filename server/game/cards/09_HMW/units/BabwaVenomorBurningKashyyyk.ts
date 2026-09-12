import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BabwaVenomorBurningKashyyyk extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'babwa-venomor#burning-kashyyyk-id',
            internalName: 'babwa-venomor#burning-kashyyyk',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent creates a Beast token',
            immediateEffect: abilityHelper.immediateEffects.createBeast((context) => ({ target: context.player.opponent }))
        });
    }
}