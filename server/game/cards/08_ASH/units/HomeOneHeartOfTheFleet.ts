import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HomeOneHeartOfTheFleet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'home-one#heart-of-the-fleet-id',
            internalName: 'home-one#heart-of-the-fleet',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal all damage from each friendly unit',
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => {
                const healAmount = (card) => card.damage;
                return { amount: healAmount, target: context.player.getArenaUnits() };
            }),
        });
    }
}