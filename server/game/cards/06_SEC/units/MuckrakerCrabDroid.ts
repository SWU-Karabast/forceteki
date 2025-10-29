import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class MuckrakerCrabDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3833614149',
            internalName: 'muckraker-crab-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is ready, it can\'t be attacked',
            condition: (context) => !context.source.exhausted,
            ongoingEffect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });
    }
}
