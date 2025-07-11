import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BlueLeaderScarifAirSupport extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2388374331',
            internalName: 'blue-leader#scarif-air-support',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResourceCost((context) => ({
                amount: 2,
                target: context.player
            })),
            ifYouDo: {
                title: 'Move this unit to the ground arena and give 2 Experience tokens to it',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.moveUnitFromSpaceToGround(),
                    AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
                ])
            }
        });
    }
}