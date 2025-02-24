import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, WildcardCardType } from '../../../core/Constants';

// Action [1 resource, Exhaust]: Exhaust a non-leader unit. If you do, its controller creates an X-Wing token.",
// On Attack: You may exhaust a unit. If you do, its controller creates an X-Wing token.",

export default class AdmiralAckbarItsATrap extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7514405173',
            internalName: 'admiral-ackbar#its-a-trap',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack',
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
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'This unit gets +2/+0',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
