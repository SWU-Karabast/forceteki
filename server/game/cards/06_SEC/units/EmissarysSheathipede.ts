import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class EmissarysSheathipede extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'emissarys-sheathipede-id',
            internalName: 'emissarys-sheathipede',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Ready a resource',
            optional: true,
            playerChoosingOptional: RelativePlayer.Opponent,
            immediateEffect: abilityHelper.immediateEffects.readyResources((context) => ({
                target: context.player.opponent,
                amount: 1
            }))
        });
    }
}