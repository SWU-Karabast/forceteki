import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class MazKanataTheLightGuides extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8834515285',
            internalName: 'maz-kanata#the-light-guides',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a Force unit. It gets +2/+0 for this attack.',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Force),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}
