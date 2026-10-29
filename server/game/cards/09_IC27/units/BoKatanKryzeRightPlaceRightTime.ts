import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BoKatanKryzeRightPlaceRightTime extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bokatan-kryze#right-place-right-time-id',
            internalName: 'bokatan-kryze#right-place-right-time',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give each enemy unit -7/-0 for this phase',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.opponent.getArenaUnits(),
                effect: abilityHelper.ongoingEffects.modifyStats({ power: -7, hp: -0 })
            }))
        });
    }
}