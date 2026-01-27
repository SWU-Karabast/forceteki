import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class TheMaxReboBandJatzWailers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-max-rebo-band#jatzwailers-id',
            internalName: 'the-max-rebo-band#jatzwailers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Credit token',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
        });
    }
}