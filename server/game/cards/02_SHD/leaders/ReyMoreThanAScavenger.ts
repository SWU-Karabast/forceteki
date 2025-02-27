import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class ReyMoreThanAScavenger extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4352150438',
            internalName: 'rey#more-than-a-scavenger',
        };
    }

    protected override setupLeaderSideAbilities () {
        this.addActionAbility({
            title: 'Give an Experience token to a unit with 2 or less power',
            cost: [AbilityHelper.costs.abilityResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardCondition: (card, _) => card.isUnit() && card.getPower() <= 2,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities () {
        this.addOnAttackAbility({
            title: 'Give an Experience token to a unit with 2 or less power',
            optional: true,
            targetResolver: {
                cardCondition: (card, _) => card.isUnit() && card.getPower() <= 2,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
