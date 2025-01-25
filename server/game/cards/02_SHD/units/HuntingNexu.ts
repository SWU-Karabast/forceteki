import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';

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
            condition: (context) => context.source.controller.isAspectInPlay(Aspect.Aggression, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
