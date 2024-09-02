import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, Trait, WildcardCardType } from '../../core/Constants';

export default class TieAdvanced extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4092697474',
            internalName: 'tie-advanced',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give 2 experience tokens to a friendly Imperial unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial) && card !== this,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
            },
            effect: 'give 2 experience tokens to {1}',
            effectArgs: (context) => [context.target]
        });
    }
}

TieAdvanced.implemented = true;