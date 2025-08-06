import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, TargetMode } from '../../../core/Constants';

export default class LandoCalrissianResponsibleBusinessman extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9250443409',
            internalName: 'lando-calrissian#responsible-businessman'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return up to 2 friendly resources to their owners’ hands',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
