import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';

export default class GamorreanRetainer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4590862665',
            internalName: 'gamorrean-retainer',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you control another Command unit, this unit gains Sentinel',
            condition: (context) => context.player.isAspectInPlay(Aspect.Command, context.source),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
