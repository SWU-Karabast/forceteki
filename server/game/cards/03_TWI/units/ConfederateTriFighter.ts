import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, CardType, WildcardRelativePlayer, ZoneName } from '../../../core/Constants';

export default class ConfederateTriFighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6277739341',
            internalName: 'confederate-trifighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Bases can not be healed',
            targetZoneFilter: ZoneName.Base,
            targetController: WildcardRelativePlayer.Any,
            targetCardTypeFilter: CardType.Base,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeHealed)
        });
    }
}
