import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class RhokaiGunship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7351946067',
            internalName: 'rhokai-gunship'
        };
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Deal 1 damage to a unit or base',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}

RhokaiGunship.implemented = true;
