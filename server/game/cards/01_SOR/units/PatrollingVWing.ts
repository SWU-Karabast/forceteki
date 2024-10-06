import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PatrollingVWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4721628683',
            internalName: 'patrolling-vwing',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller })),
        });
    }
}

PatrollingVWing.implemented = true;
