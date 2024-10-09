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

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you control 6 or more resources, this unit gains Sentinel',
            condition: (context) => context.source.controller.resources.length >= 6,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}

HomesteadMilitia.implemented = true;
