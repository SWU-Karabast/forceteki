import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class SugiHiredGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9871430123',
            internalName: 'sugi#hired-guardian'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Gain Sentinel while an enemy unit is upgraded',
            condition: (context) => context.player.opponent.getArenaUnits({ condition: (card) => card.isUnit() && card.isUpgraded() }).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
