import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';


export default class R2D2IgnoringProtocol extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9568000754',
            internalName: 'r2d2#ignoring-protocol'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Look at the top card of your deck. You may put it on the bottom of your deck.',
            immediateEffect: AbilityHelper.immediateEffects.scry({
                amount: 1,
            })
        });

        this.addOnAttackAbility({
            title: 'Look at the top card of your deck. You may put it on the bottom of your deck.',
            immediateEffect: AbilityHelper.immediateEffects.scry({
                amount: 1,
            })
        });
    }
}

R2D2IgnoringProtocol.implemented = true;