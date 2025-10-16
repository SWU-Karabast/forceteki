import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { DamagePreventionType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class QueenAmidalaChampioningHerPeople extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'queen-amidala#championing-her-people-id',
            internalName: 'queen-amidala#championing-her-people'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Spy tokens',
            immediateEffect: AbilityHelper.immediateEffects.createSpy({ amount: 2 })
        });
        registrar.addDamagePreventionAbility({
            title: 'Defeat a friendly unit that shares a trait with this unit to prevent all damage that would be dealt to this unit',
            preventionType: DamagePreventionType.Replace,
            optional: true,
            replaceWithEffect: AbilityHelper.immediateEffects.selectCard(({
                cardCondition: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source && Array.from(context.source.traits).some((trait) => card.hasSomeTrait(trait)),
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }))
        });
    }
}