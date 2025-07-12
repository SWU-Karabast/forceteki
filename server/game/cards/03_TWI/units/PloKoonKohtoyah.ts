import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName } from '../../../core/Constants';

export default class PloKoonKohtoyah extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7494987248',
            internalName: 'plo-koon#kohtoyah'
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Raid 3',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 3 }),
        });
    }
}
