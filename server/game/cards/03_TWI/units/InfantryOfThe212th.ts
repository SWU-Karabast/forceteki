import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName } from '../../../core/Constants';

export default class InfantryOfThe212th extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4179773207',
            internalName: 'infantry-of-the-212th'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Sentinel',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
