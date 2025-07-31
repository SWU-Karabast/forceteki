import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class MillenniumFalconBucketOfBolts extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6270777752',
            internalName: 'millennium-falcon#bucket-of-bolts',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If your base has more damage on it than an enemy base, ready this unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.base.damage > context.player.opponent.base.damage,
                onTrue: abilityHelper.immediateEffects.ready()
            })
        });
    }
}