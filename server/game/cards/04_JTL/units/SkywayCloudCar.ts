import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SkywayCloudCar extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5177897609',
            internalName: 'skyway-cloud-car',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Return a non-leader unit with 2 or less power to its owner\'s hand',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.getPower() <= 2,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
            }
        });
    }
}
