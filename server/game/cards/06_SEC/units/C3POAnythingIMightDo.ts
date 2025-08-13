import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class C3POAnythingIMightDo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'c3po#anything-i-might-do-id',
            internalName: 'c3po#anything-i-might-do',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give a unit +2/+2 for this phase',
            cost: [abilityHelper.costs.exhaustSelf(), abilityHelper.costs.returnSelfToHandFromPlay()],
            cannotTargetFirst: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}
