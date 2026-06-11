import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class SummaVerminoth extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8724833287',
            internalName: 'summaverminoth',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat all other space units',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => {
                const allSpaceUnits = context.game.getArenaUnits({ otherThan: context.source, arena: ZoneName.SpaceArena });
                return { target: allSpaceUnits };
            })
        });
    }
}