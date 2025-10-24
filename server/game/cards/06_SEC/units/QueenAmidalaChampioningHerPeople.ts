import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamagePreventionType } from '../../../core/Constants';

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
            title: 'Defeat a friendly unit that shares a trait with Queen Amidala to prevent all damage to her',
            preventionType: DamagePreventionType.All,
            optional: true,
            onlyIfYouDoEffect: AbilityHelper.immediateEffects.selectCard(({
                cardCondition: (card, context) => card.isUnit() && card.controller === context.player &&
                  card !== context.source && Array.from(context.source.traits).some((trait) => card.hasSomeTrait(trait)),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }))
        });
    }
}