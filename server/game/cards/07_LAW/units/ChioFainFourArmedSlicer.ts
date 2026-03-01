import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChioFainFourArmedSlicer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3569658495',
            internalName: 'chio-fain#fourarmed-slicer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addOnAttackAbility({
            title: 'Both players draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({
                target: [context.player, context.player.opponent],
                amount: 1
            }))
        });
    }
}