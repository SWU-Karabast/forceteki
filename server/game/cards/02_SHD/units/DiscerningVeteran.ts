import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class DiscerningVeteran extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9765804063',
            internalName: 'discerning-veteran',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'This unit captures an enemy non-leader ground unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.capture()
            }
        });
    }
}
