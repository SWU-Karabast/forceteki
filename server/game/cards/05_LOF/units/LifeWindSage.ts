import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class LifeWindSage extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5522824465',
            internalName: 'life-wind-sage',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While an enemy unit is exhausted, this unit gains Raid 2',
            condition: (context) => context.player.opponent.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.exhausted }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}