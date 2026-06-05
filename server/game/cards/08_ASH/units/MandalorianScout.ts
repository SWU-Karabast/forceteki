import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MandalorianScout extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6885821500',
            internalName: 'mandalorian-scout',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Exhaust a ready friendly resource',
            immediateEffect: AbilityHelper.immediateEffects.exhaustResources((context) => ({ target: context.player, amount: 1 })),
        });
    }
}