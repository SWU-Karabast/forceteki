import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, WildcardLocation } from '../../../core/Constants';

export default class PartisanInsurgent extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4642322279',
            internalName: 'partisan-insurgent'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you control another [Aggression] unit, this unit gains Raid 2',
            condition: (context) => context.source.controller.getOtherUnitsInPlayWithAspect(context.source, Aspect.Aggression).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}

PartisanInsurgent.implemented = true;
