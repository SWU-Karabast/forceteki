import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { ZoneName } from '../../../core/Constants';

export default class L337DroidRevolutionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9552605383',
            internalName: 'l337#droid-revolutionary'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Rescue a captured card. if you do not, give a Shield token to this unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Capture,
                immediateEffect: AbilityHelper.immediateEffects.rescue(),
            },
            ifYouDoNot: {
                title: 'Give a Shield token to this unit',
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
