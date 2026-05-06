import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class R5D4BuiltForAdventure extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'r5d4#built-for-adventure-id',
            internalName: 'r5d4#built-for-adventure',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Defeat all upgrade on the defending unit',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                target: context.event.attack.getAllTargets().flatMap((x) => x.upgrades)
            }))
        });
    }
}