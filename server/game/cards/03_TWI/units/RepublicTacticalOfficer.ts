import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class RepublicTacticalOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2395430106',
            internalName: 'republic-tactical-officer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Republic),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}
