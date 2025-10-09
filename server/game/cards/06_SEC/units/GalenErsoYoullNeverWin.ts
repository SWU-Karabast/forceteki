import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GalenErsoYoullNeverWin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'galen-erso#youll-never-win-id',
            internalName: 'galen-erso#youll-never-win',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // TODO
    }
}
