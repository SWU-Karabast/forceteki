import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class MandalorianWarrior extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1081897816',
            internalName: 'mandalorian-warrior',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Give 1 experience to another Mandalorian unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Mandalorian),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
