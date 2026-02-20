import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RookieRocketjumper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5626708588',
            internalName: 'rookie-rocketjumper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Pay 1 resource to give a Shield token to this unit',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 1, target: context.player })),
            ifYouDo: {
                title: 'Give a Shield token to this unit',
                immediateEffect: abilityHelper.immediateEffects.giveShield((context) => ({
                    target: context.source
                })),
            }
        });
    }
}