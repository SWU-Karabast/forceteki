import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class ContractedHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7489502985',
            internalName: 'contracted-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat this unit',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat(),
        });
    }
}
