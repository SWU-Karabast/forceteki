import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class PreMorPersonnelCarrier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'premor-personnel-carrier-id',
            internalName: 'premor-personnel-carrier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give this unit an Experience token for each ground unit you control',
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                amount: context.player.getArenaUnits({ arena: ZoneName.GroundArena }).length,
                target: context.source
            })),
        });
    }
}
