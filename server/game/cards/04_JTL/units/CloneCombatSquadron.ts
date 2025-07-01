import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class CloneCombatSquadron extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3213928129',
            internalName: 'clone-combat-squadron',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
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