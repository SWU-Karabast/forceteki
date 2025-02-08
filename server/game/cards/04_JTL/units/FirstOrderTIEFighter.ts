import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardZoneName } from '../../../core/Constants';

export default class FirstOrderTIEFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1034181657',
            internalName: 'first-order-tie-fighter',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you control a token unit, this unit gain Raid 1',
            condition: (context) => context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.isTokenUnit()).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
