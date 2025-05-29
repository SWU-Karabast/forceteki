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
        this.addTriggeredAbility({
            title: 'Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.lookMoveDeckCardsTopOrBottom({ amount: 2 })
        });
    }
}
