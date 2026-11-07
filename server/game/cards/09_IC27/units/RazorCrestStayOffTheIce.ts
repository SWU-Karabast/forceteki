import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class RazorCrestStayOffTheIce extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'razor-crest#stay-off-the-ice-id',
            internalName: 'razor-crest#stay-off-the-ice'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each unit loses all When Defeated abilities',
            targetController: WildcardRelativePlayer.Any,
            targetCardTypeFilter: WildcardCardType.Unit,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.loseAllWhenDefeatedAbilities()
        });
    }
}
