import AbilityHelper from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class CloneCohort extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2007876522',
            internalName: 'clone-cohort'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });

        card.addGainKeywordTargetingAttached({
            keyword: KeywordName.Raid,
            amount: 2
        });
    }
}
