import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

// TODO: add test for this once we have deck validation test framework in place
export default class SwarmingVultureDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2177194044',
            internalName: 'swarming-vulture-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each other friendly Swarming Vulture Droid',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => {
                const spaceArenaUnitCount = target.controller.getArenaUnits({
                    condition: (card) => card.name === target.name,
                    otherThan: target
                }).length;
                return ({
                    power: spaceArenaUnitCount,
                    hp: 0,
                });
            }),
        });
    }
}