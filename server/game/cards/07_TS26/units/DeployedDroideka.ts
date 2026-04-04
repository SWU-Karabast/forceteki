import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DeployedDroideka extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'deployed-droideka-id',
            internalName: 'deployed-droideka',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Pay ${TextHelper.resource(2)} to give an Experience token and a Shield token to this unit`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 2, target: context.player })),
            ifYouDo: {
                title: 'Give an Experience token and a Shield token to this unit',
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.giveExperience((context) => ({
                        target: context.source
                    })),
                    abilityHelper.immediateEffects.giveShield((context) => ({
                        target: context.source
                    }))
                ])
            }
        });
    }
}
