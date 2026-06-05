import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LukeSkywalkerAnsweringTheCall extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5301694614',
            internalName: 'luke-skywalker#answering-the-call',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to each enemy unit',
            immediateEffect:
                abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.getArenaUnits().length >= 4,
                    onTrue: abilityHelper.immediateEffects.damage((context) => ({
                        amount: 3,
                        target: context.player.opponent.getArenaUnits()
                    }))
                })
        });
    }
}
