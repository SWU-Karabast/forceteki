import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AdmiralYularenAdvisingCaution extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0268657344',
            internalName: 'admiral-yularen#advising-caution',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each other friendly Heroism unit gets +0/+1',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) => card !== context.source && card.hasSomeAspect(Aspect.Heroism),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}

AdmiralYularenAdvisingCaution.implemented = true;
