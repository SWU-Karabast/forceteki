import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardZoneName } from '../../../core/Constants';

export default class R2D2Artooooooooo extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5375722883',
            internalName: 'r2d2#artooooooooo',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addPilotingGainAbilityTargetingAttached({
            title: 'You may play or deploy 1 additional Pilot on this unit',
            type: AbilityType.Constant,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPilotingLimit({ amount: 1 })
        });

        card.addConstantAbility({
            title: 'This upgrade can be played on a friendly Vehicle unit with a Pilot on it.',
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: AbilityHelper.ongoingEffects.ignorePilotingPilotLimit(),
        });
    }
}
