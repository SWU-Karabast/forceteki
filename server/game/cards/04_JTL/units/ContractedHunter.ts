import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class ContractedHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7489502985',
            internalName: 'contracted-hunter',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Defeat this unit',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat(),
        });
    }
}
