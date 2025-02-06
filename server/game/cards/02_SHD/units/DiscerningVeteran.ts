import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class DiscerningVeteran extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '9765804063',
            internalName: 'discerning-veteran',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'This unit captures an enemy non-leader ground unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.capture()
            }
        });
    }
}
