import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HuntingAggressor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4560739921',
            internalName: 'hunting-aggressor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Indirect damage you deal to opponents is increased by 1',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyIndirectDamage({
                amount: 1,
                opponentsOnly: true
            })
        });
    }
}
