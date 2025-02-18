import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { WildcardZoneName } from '../../../core/Constants';

export default class TradeFederationShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8345985976',
            internalName: 'trade-federation-shuttle',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Create a Battle Droid token.',
            // eslint-disable-next-line @stylistic/object-curly-newline
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.getUnitsInPlay(
                    WildcardZoneName.AnyArena,
                    (unit: IUnitCard) => unit.damage > 0).length > 0,

                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
            })
        });
    }
}
