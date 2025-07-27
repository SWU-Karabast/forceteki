import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class AdelphiPatrolWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9757839764',
            internalName: 'adelphi-patrol-wing',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a unit. If you have the initiative, it gets +2/+0 for this attack.',
            optional: true,
            initiateAttack: {
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    condition: (_attack, context) => context.player.hasInitiative()
                }
            }
        });
    }
}