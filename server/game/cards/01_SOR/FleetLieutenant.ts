import AbilityHelper from '../../AbilityHelper';
import { UnitCard } from '../../core/card/CardTypes';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Trait } from '../../core/Constants';

export default class FleetLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3038238423',
            internalName: 'fleet-lieutenant',
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                effects: AbilityHelper.ongoingEffects.conditionalAttackStatBonus({
                    bonusCondition: (attacker: UnitCard) => attacker.hasSomeTrait(Trait.Rebel),
                    statBonus: { power: 2, hp: 0 }
                })
            }
        });
    }
}

FleetLieutenant.implemented = true;