import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class MaarvaAndorWeveBeenSleeping extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'maarva-andor#weve-been-sleeping-id',
            internalName: 'maarva-andor#weve-been-sleeping',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to each friendly Rebel unit',
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 1,
                target: context.player.getArenaUnits({ trait: Trait.Rebel }),
            }))
        });
    }
}
