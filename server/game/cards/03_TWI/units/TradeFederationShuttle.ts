import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TradeFederationShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8345985976',
            internalName: 'trade-federation-shuttle',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Create a Battle Droid token.',

            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.damage > 0 }),

                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
            })
        });
    }
}
