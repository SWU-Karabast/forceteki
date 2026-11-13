import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class K2SOEvacuateTheVaultDoor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7949467778',
            internalName: 'k2so#evacuate-the-vault-door',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Deal 5 damage to each enemy unit and each enemy base',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                amount: 5,
                target: [...context.player.opponent.getArenaUnits(), context.player.opponent.base]
            }))
        });
    }
}