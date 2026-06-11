import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class PazVizslaForABrighterFuture extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7107655724',
            internalName: 'paz-vizsla#for-a-brighter-future',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'If this unit wasn\'t defeated by combat damage, create 2 Mandalorian tokens',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.defeatSource.type !== DefeatSourceType.Attack,
                onTrue: AbilityHelper.immediateEffects.createMandalorian({ amount: 2 })
            })
        });
    }
}