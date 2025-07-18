import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName } from '../../../core/Constants';

export default class RepublicCommando extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8187818742',
            internalName: 'republic-commando',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Saboteur',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
        });
    }
}
