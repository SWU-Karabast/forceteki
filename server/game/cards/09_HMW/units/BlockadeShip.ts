import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BlockadeShip extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'blockade-ship-id',
            internalName: 'blockade-ship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Enemy ground units get -1/-0 while attacking',
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: WildcardCardType.Unit,
            targetZoneFilter: ZoneName.GroundArena,
            matchTarget: (card) => card.isUnit() && card.isAttacking(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
