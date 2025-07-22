import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class HanSoloScruffyLookingNerfHerder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4136801536',
            internalName: 'han-solo#scruffylooking-nerf-herder',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The defender gets -2/-0 for this attack',
            immediateEffect: abilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.event.attack.getAllTargets(),
                effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
            })),
        });
    }
}