import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer } from '../../../core/Constants';


export default class CloneDiveTrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5445166624',
            internalName: 'clone-dive-trooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'While this unit is attacking, the defender gets -2/-0.',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isDefending() && card.activeAttack.attacker === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
        });
    }
}
