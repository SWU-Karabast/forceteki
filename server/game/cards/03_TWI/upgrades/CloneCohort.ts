import AbilityHelper from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class CloneCohort extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2007876522',
            internalName: 'clone-cohort'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });

        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Raid,
            amount: 2
        });
    }
}
