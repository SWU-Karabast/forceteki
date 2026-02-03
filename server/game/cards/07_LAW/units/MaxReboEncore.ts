import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class MaxReboEncore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5320092651',
            internalName: 'max-rebo#encore',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'There is an additional regroup phase after the first regroup phase each round',
            ongoingEffect: AbilityHelper.ongoingEffects.additionalPhase({ phase: PhaseName.Regroup })
        });
    }
}