import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ConcordDawnInterceptors extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7486516061',
            internalName: 'concord-dawn-interceptors',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit gets +2/+0 while defending',
            condition: (context) => context.source.isDefending(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
