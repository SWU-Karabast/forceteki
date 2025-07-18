import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HanSoloScruffyLookingNerfHerder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4136801536',
            internalName: 'han-solo#scruffylooking-nerf-herder',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'The defender gets -2/-0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.event.attack.getAllTargets(),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
            })),
        });
    }
}