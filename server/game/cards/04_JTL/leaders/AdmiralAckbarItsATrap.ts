import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AdmiralAckbarItsATrap extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7514405173',
            internalName: 'admiral-ackbar#its-a-trap',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Exhaust a non-leader unit',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Its controller creates an X-Wing token',
                immediateEffect: AbilityHelper.immediateEffects.createXWing({ target: ifYouDoContext.target.controller })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Exhaust a non-leader unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Its controller creates an X-Wing token',
                immediateEffect: AbilityHelper.immediateEffects.createXWing({ target: ifYouDoContext.target.controller })
            })
        });
    }
}
