import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class AdmiralMottiConanInCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'admiral-motti#conan-in-command-id',
            internalName: 'admiral-motti#conan-in-command',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Give an Experience token to each other friendly ${TextHelper.Trait.Imperial} unit`,
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 1,
                target: context.player.getArenaUnits({ trait: Trait.Imperial, otherThan: context.source })
            })),
        });
    }
}