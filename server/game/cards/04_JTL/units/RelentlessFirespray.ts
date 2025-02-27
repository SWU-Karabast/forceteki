import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class RelentlessFirespray extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4147863169',
            internalName: 'relentless-firespray',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Ready this unit',
            limit: AbilityLimit.perRound(1),
            immediateEffect: AbilityHelper.immediateEffects.ready((context) => ({
                target: context.source
            }))
        });
    }
}
