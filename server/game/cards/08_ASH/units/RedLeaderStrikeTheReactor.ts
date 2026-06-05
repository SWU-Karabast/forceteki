import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class RedLeaderStrikeTheReactor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0770708432',
            internalName: 'red-leader#strike-the-reactor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit can attack units in either arena',
            ongoingEffect: [
                OngoingEffectBuilder.card.static(EffectName.CanAttackGroundArenaFromSpaceArena),
                OngoingEffectBuilder.card.static(EffectName.CanAttackSpaceArenaFromGroundArena)
            ]
        });
    }
}
