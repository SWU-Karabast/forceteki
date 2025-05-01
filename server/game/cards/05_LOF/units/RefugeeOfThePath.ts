import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class RefugeeOfThePath extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0102737248',
            internalName: 'refugee-of-the-path',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give a Shield token to a unit with Sentinel',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeKeyword(KeywordName.Sentinel),
                immediateEffect: AbilityHelper.immediateEffects.giveShield(),
            }
        });
    }
}