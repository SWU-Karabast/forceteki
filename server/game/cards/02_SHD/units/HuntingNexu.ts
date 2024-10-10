import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, Location } from '../../../core/Constants';

export default class HuntingNexu extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8991513192',
            internalName: 'hunting-nexu'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you control another Aggression unit, this unit gains Raid 2',
            condition: (context) => context.source.controller.getOtherUnitsInPlayWithAspect(context.source, Aspect.Aggression).length > 0,
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}

HuntingNexu.implemented = true;
