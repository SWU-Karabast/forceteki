import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class CloneCombatSquadron extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3213928129',
            internalName: 'clone-combat-squadron',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+1 for each other friendly space unit.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => {
                const spaceArenaUnitCount = target.controller.getArenaUnits({
                    condition: (card) => card.zone.name === ZoneName.SpaceArena,
                    otherThan: target
                }).length;
                return ({
                    power: spaceArenaUnitCount,
                    hp: spaceArenaUnitCount,
                });
            }),
        });
    }
}