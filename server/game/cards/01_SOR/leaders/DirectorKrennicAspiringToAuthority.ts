import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class DirectorKrennicAspiringToAuthority extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8560666697',
            internalName: 'director-krennic#aspiring-to-authority',
        };
    }

    private buildKrennicAbilityProperties(AbilityHelper: IAbilityHelper) {
        return {
            title: 'Give each friendly damaged unit +1/+0',
            matchTarget: (card) => card.isUnit() && card.damage !== 0,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildKrennicAbilityProperties(AbilityHelper));
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildKrennicAbilityProperties(AbilityHelper));
    }
}
