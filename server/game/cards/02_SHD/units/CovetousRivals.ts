import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class CovetousRivals extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1304452249',
            internalName: 'covetous-rivals',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 2 damage to a unit with a Bounty',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeKeyword(KeywordName.Bounty),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
