import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { ZoneName } from '../../../core/Constants';

export default class L337DroidRevolutionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9552605383',
            internalName: 'l337#droid-revolutionary'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Rescue a captured card',
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

L337DroidRevolutionary.implemented = true;