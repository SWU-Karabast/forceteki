import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SwoopBikeMarauder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3151374593',
            internalName: 'swoop-bike-marauder'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.draw()
        });
    }
}