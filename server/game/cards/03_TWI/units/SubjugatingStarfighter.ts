import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SubjugatingStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4824842849',
            internalName: 'subjugating-starfighter',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Create a Battle Droid token',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasInitiative(),
                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
            })
        });
    }
}
