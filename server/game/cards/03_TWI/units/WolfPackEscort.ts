import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class WolfPackEscort extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1882027961',
            internalName: 'wolf-pack-escort'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return a friendly non-leader, non-Vehicle unit to its owner\'s hand.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

WolfPackEscort.implemented = true;