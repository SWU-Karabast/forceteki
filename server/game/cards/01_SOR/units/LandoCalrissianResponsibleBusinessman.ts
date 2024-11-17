import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, TargetMode } from '../../../core/Constants';

export default class LandoCalrissianResponsibleBusinessman extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9250443409',
            internalName: 'lando-calrissian#responsible-businessman'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return up to 2 friendly resources to their owners’ hands',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                locationFilter: Location.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

LandoCalrissianResponsibleBusinessman.implemented = true;