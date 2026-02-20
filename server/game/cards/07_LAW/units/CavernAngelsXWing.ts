import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class CavernAngelsXWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5606781252',
            internalName: 'cavern-angels-xwing'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Deal 2 damage to a base',
            targetResolver: {
                zoneFilter: ZoneName.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 }),
            }
        });
    }
}