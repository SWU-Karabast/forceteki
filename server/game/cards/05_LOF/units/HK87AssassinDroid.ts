import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class HK87AssassinDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9160311421',
            internalName: 'hk87-assassin-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Deal 2 damage to each ground unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.player.getArenaUnits({ arena: ZoneName.GroundArena }).concat(context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena })),
            }))
        });
    }
}
