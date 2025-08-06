import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class IndependentSmuggler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0587196584',
            internalName: 'independent-smuggler',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingConstantAbilityTargetingAttached({
            title: 'Attached unit gains Raid 1',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
