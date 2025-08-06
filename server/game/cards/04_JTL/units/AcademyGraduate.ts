import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class AcademyGraduate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3874382333',
            internalName: 'academy-graduate',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Sentinel
        });
    }
}