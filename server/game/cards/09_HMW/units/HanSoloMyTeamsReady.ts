import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HanSoloMyTeamsReady extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'han-solo#my-teams-ready-id',
            internalName: 'han-solo#my-teams-ready',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Ready another unit',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.ready()
            }
        });
    }
}