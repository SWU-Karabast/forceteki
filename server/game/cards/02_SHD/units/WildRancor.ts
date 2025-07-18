import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class WildRancor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9270539174',
            internalName: 'wild-rancor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to each other ground unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                target: context.player.getArenaUnits({ otherThan: context.source, arena: ZoneName.GroundArena }).concat(context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena })),
                amount: 2
            }))
        });
    }
}
