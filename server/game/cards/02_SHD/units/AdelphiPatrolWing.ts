import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Attack } from '../../../core/attack/Attack';

export default class AdelphiPatrolWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9757839764',
            internalName: 'adelphi-patrol-wing',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may attack with a unit. If you have the initiative, it gets +2/+0 for this attack.',
            optional: true,
            initiateAttack: {
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    condition: (attack: Attack) => attack.attacker.controller.hasInitiative()
                }
            }
        });
    }
}