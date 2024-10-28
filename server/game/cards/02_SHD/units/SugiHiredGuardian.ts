import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardLocation } from '../../../core/Constants';

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
            condition: (context) => context.source.controller.opponent.getUnitsInPlay(WildcardLocation.AnyArena, (card) => card.isUpgraded()).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}

SugiHiredGuardian.implemented = true;
