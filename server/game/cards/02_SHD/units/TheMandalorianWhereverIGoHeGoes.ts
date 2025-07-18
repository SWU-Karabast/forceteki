import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheMandalorianWhereverIGoHeGoes extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6585115122',
            internalName: 'the-mandalorian#wherever-i-go-he-goes',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'You may heal all damage from a unit that costs 2 or less and give 2 Shield tokens to it',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 2,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal((context) => ({ amount: context.target.damage })),
                    AbilityHelper.immediateEffects.giveShield({ amount: 2 })
                ])
            }
        });
    }
}
