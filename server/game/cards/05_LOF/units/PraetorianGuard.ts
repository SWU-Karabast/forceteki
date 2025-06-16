import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class PraetorianGuard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5841324811',
            internalName: 'praetorian-guard',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control a unit with 4 or more power, this unit gains Sentinel',
            condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.getPower() >= 4 }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}