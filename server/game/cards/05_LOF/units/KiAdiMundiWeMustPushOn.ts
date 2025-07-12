import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KiAdiMundiWeMustPushOn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0531276830',
            internalName: 'kiadimundi#we-must-push-on',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Use the Force to draw 2 cards',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Draw 2 cards',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 })
            }
        });
    }
}