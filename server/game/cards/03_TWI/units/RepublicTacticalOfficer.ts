import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import type { Attack } from '../../../core/attack/Attack';

export default class RepublicTacticalOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2395430106',
            internalName: 'republic-tactical-officer',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    condition: (attack: Attack) => attack.attacker.hasSomeTrait(Trait.Republic)
                }
            }
        });
    }
}
