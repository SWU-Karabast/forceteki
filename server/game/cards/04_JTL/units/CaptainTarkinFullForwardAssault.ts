import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class CaptainTarkinFullForwardAssault extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3666212779',
            internalName: 'captain-tarkin#full-forward-assault',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each friendly Vehicle unit gets +1/+0 and gains Overwhelm',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card) => card.hasSomeTrait(Trait.Vehicle),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
            ]
        });
    }
}
