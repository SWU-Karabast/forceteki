import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class HeraSyndullaWeveLostEnough extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9430527677',
            internalName: 'hera-syndulla#weve-lost-enough',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Restore,
            amount: 1
        });
    }
}