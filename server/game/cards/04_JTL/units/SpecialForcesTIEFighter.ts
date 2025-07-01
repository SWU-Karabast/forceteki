import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class SpecialForcesTIEFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9595057518',
            internalName: 'special-forces-tie-fighter',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Ready this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.controlsLessUnitsInSpaceArena(context),
                onTrue: AbilityHelper.immediateEffects.ready(),
            })
        });
    }

    private controlsLessUnitsInSpaceArena(context) {
        return context.player.getArenaUnits({ arena: ZoneName.SpaceArena }).length < context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena }).length;
    }
}