import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheMandalorianFromTheShadows extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-mandalorian#from-the-shadows-id',
            internalName: 'the-mandalorian#from-the-shadows',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If the defending unit is exhausted, it gets -4/-0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.source.activeAttack?.getAllTargets().filter((target) => target.isUnit() && target.exhausted) ?? [],
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
            }))
        });
    }
}