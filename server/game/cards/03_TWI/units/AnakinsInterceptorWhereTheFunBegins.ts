import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class AnakinsInterceptorWhereTheFunBegins extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4551109857',
            internalName: 'anakins-interceptor#where-the-fun-begins',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While your base has 15 or more damage on it, this unit gets +2/+0.',
            condition: (context) => context.source.controller.base.damage >= 15,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}

AnakinsInterceptorWhereTheFunBegins.implemented = true;