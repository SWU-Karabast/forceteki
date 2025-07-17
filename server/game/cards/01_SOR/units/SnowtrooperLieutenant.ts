import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Attack } from '../../../core/attack/Attack';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class SnowtrooperLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9097690846',
            internalName: 'snowtrooper-lieutenant'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
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
