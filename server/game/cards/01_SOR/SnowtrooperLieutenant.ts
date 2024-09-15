import AbilityHelper from '../../AbilityHelper';
import { Attack } from '../../core/attack/Attack';
import { UnitCard } from '../../core/card/CardTypes';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Trait } from '../../core/Constants';

export default class SnowtrooperLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9097690846',
            internalName: 'snowtrooper-lieutenant'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    condition: (attack: Attack) => attack.attacker.hasSomeTrait(Trait.Imperial)
                }
            }
        });
    }
}

SnowtrooperLieutenant.implemented = true;