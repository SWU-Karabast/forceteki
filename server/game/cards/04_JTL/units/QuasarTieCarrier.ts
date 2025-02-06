import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class QuasarTieCarrier extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2657417747',
            internalName: 'quasar-tie-carrier',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Create a TIE Fighter token',
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter()
        });
    }
}
