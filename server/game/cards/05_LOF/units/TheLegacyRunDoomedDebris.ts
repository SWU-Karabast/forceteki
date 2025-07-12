import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class TheLegacyRunDoomedDebris extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-legacy-run#doomed-debris-id',
            internalName: 'the-legacy-run#doomed-debris',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Deal 6 damage divided as you choose among enemy units',
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                amountToDistribute: 6,
                canChooseNoTargets: false,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit
            })
        });
    }
}
