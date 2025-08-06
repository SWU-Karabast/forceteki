import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class BabuFrikHeyyy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6501780064',
            internalName: 'babu-frik#heyyy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a friendly Droid unit. For this attack, it deals damage equal to its remaining HP instead of its power.',
            cost: AbilityHelper.costs.exhaustSelf(),
            optional: true,
            initiateAttack: {
                attackerCondition: (card, context) =>
                    card.controller === context.player &&
                    card.hasSomeTrait(Trait.Droid),
                attackerCombatDamageOverride: (attack) => attack.attacker.remainingHp
            }
        });
    }
}