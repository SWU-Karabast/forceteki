import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class AtAtSuppressor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6663619377',
            internalName: 'atat-suppressor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust all ground units',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                const opponentGroundUnits = context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena });
                const friendlyGroundUnits = context.player.getArenaUnits({ arena: ZoneName.GroundArena });

                return { target: opponentGroundUnits.concat(friendlyGroundUnits) };
            })
        });
    }
}
