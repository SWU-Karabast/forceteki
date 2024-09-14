import AbilityHelper from '../../AbilityHelper';
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
                effects: AbilityHelper.ongoingEffects.conditionalAttackStatBonus({
                    bonusCondition: (attacker: UnitCard) => attacker.hasSomeTrait(Trait.Imperial),
                    statBonus: { power: 2, hp: 0 }
                })
            }
        });
    }
}

SnowtrooperLieutenant.implemented = true;