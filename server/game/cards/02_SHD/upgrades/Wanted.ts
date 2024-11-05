import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class Wanted extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4117365450',
            internalName: 'wanted',
        };
    }

    public override setupCardAbilities() {
        this.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Ready two friendly resources',
                // force resolution of this just to skip prompting the player. we can safely assume they will always want to ready resources
                optional: false,
                immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 2 })
            }
        });
    }
}

Wanted.implemented = true;
