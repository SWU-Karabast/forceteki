import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class GoldLeaderFastestShipInTheFleet extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6300552434',
            internalName: 'gold-leader#fastest-ship-in-the-fleet',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is defending, the attacker gets -1/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack.getAllTargets().includes(context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
