import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';


export default class InfernoFourUnforgetting extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9133080458',
            internalName: 'inferno-four#unforgetting'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.',
            immediateEffect: AbilityHelper.immediateEffects.scry({
                amount: 2,
            })
        });
        this.addWhenDefeatedAbility({
            title: 'Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.',
            immediateEffect: AbilityHelper.immediateEffects.scry({
                amount: 2,
            })
        });
    }
}

InfernoFourUnforgetting.implemented = true;