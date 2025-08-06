import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BazineNetalSpyForTheFirstOrder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5830140660',
            internalName: 'bazine-netal#spy-for-the-first-order',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard(),
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent }))
                ])
            }))
        });
    }
}
