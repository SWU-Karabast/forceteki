import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer } from '../../../core/Constants';


export default class CloneDiveTrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5445166624',
            internalName: 'clone-dive-trooper',
        };
    }

    public override setupCardAbilities () {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'While this unit is attacking, the defender gets -2/-0.',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isDefending() && card.activeAttack.attacker === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
        });
    }
}

CloneDiveTrooper.implemented = true;
