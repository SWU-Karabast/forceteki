import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

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
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}

AdmiralYularenAdvisingCaution.implemented = true;
