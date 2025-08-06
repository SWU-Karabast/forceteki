import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

export default class AcademyDefenseWalker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7596515127',
            internalName: 'academy-defense-walker'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to each friendly damaged unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.player.getArenaUnits({ condition: (unit: IUnitCard) => unit.damage > 0 })
            }))
        });
    }
}
