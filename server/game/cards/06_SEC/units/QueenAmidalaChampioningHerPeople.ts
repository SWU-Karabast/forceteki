import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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

        registrar.addReplacementEffectAbility({
            title: 'Prevent Damage',
            optional: true,
            when: {
                onDamageDealt: (event, context) => event.card === context.source
            },
            onlyIfYouDoEffect: AbilityHelper.immediateEffects.selectCard(({
                cardCondition: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source && Array.from(context.source.traits).some((trait) => card.hasSomeTrait(trait)),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }))
        });
    }
}