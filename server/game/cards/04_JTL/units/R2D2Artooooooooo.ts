import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardZoneName } from '../../../core/Constants';

export default class R2D2Artooooooooo extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5375722883',
            internalName: 'r2d2#artooooooooo',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingConstantAbilityTargetingAttached({
            title: 'You may play or deploy 1 additional Pilot on this unit',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPilotingLimit({ amount: 1 })
        });

        this.addConstantAbility({
            title: 'This upgrade can be played on a friendly Vehicle unit with a Pilot on it.',
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: AbilityHelper.ongoingEffects.ignorePilotingPilotLimit(),
        });
    }
}
