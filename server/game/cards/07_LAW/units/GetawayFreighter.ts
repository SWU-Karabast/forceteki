import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class GetawayFreighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3545978399',
            internalName: 'getaway-freighter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Create a Credit token',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ arena: ZoneName.GroundArena }),
                onTrue: abilityHelper.immediateEffects.createCreditToken()
            })
        });
    }
}