import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class TheGhostHeartOfTheFamily extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5763330426',
            internalName: 'the-ghost#heart-of-the-family'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Gain sentinel while upgraded',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}