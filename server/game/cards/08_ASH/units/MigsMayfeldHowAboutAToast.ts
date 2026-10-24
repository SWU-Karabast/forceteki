import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MigsMayfeldHowAboutAToast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2696522642',
            internalName: 'migs-mayfeld#how-about-a-toast',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to the defending unit. If this unit is upgraded, deal 2 damage to the defending unit instead',
            contextTitle: (context) => `Deal ${context.source.isUpgraded() ? 2 : 1} damage to the defending unit`,
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: () => context.source.activeAttack?.getAllTargets().some((x) => x.isUnit()),
                onTrue: AbilityHelper.immediateEffects.damage({
                    target: context.source.activeAttack?.getAllTargets().filter((x) => x.isUnit()) ?? [],
                    amount: context.source.isUpgraded() ? 2 : 1
                })
            }))
        });
    }
}