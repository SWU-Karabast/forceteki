import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class HomesteadMilitia extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3138552659',
            internalName: 'homestead-militia'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'While you control 6 or more resources, this unit gains Sentinel',
            condition: (context) => context.player.resources.length >= 6,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
