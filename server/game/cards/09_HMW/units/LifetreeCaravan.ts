import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class LifetreeCaravan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'lifetree-caravan-id',
            internalName: 'lifetree-caravan',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Resource the top card of your deck',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (c) => c.player.getArenaUnits().length >= 3,
                onTrue: abilityHelper.immediateEffects.resourceCard((c) => ({
                    target: c.player.getTopCardOfDeck()
                }))
            })
        });
    }
}