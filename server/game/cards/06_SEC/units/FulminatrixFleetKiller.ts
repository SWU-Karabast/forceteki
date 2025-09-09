import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class FulminatrixFleetKiller extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'fulminatrix#fleet-killer-id',
            internalName: 'fulminatrix#fleet-killer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            title: 'Deal 4 damage to a ground unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 4 })
            }
        });
    }
}
