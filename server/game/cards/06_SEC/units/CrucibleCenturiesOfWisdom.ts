import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CrucibleCenturiesOfWisdom extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'crucible#centuries-of-wisdom-id',
            internalName: 'crucible#centuries-of-wisdom',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to each other friendly unit.',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 1,
                target: context.player.getArenaUnits({ otherThan: context.source })
            }))
        });
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to each other friendly unit.',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 1,
                target: context.player.getArenaUnits({ otherThan: context.source })
            }))
        });
    }
}