import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HK87AssassinDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9160311421',
            internalName: 'hk87-assassin-droid',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Deal 2 damage to each ground unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.game.groundArena.getUnitCards(),
            }))
        });
    }
}
