import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, WildcardLocation } from '../../../core/Constants';

export default class GamorreanGuards extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2739464284',
            internalName: 'gamorrean-guards'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you control another Cunning unit, this unit gains Sentinel',
            condition: (context) => context.source.controller.getOtherUnitsInPlayWithAspect(context.source, Aspect.Cunning).length > 0,
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}

GamorreanGuards.implemented = true;
