import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class TechSourceOfInsight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3881257511',
            internalName: 'tech#source-of-insight'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each friendly resource gains Smuggle',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({
                keyword: KeywordName.Smuggle,

            })
        });
    }
}

TechSourceOfInsight.implemented = true;
