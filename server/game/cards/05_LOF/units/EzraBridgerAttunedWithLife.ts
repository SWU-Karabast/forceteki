import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class EzraBridgerAttunedWithLife extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0726963200',
            internalName: 'ezra-bridger#attuned-with-life',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Give an Experience token to another Creature or Spectre unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait([Trait.Creature, Trait.Spectre]),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
