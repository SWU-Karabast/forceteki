import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ImperialDefector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7534349651',
            internalName: 'imperial-defector'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand',
            immediateEffect: abilityHelper.immediateEffects.lookAt((context) => ({
                target: context.player.opponent.hand,
                useDisplayPrompt: true
            }))
        });
    }
}
