import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ClanChallengers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3487311898',
            internalName: 'clan-challengers',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While this unit is upgraded, it gains Overwhelm',
            condition: (context) => context.source.upgraded,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
        });
    }
}

ClanChallengers.implemented = true;
