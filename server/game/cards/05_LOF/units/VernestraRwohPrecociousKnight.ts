import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class VernestraRwohPrecociousKnight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'vernestra-rwoh#precocious-knight-id',
            internalName: 'vernestra-rwoh#precocious-knight',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use the Force to ready this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Ready this unit',
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}
