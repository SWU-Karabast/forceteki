import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class ScionShuttleAtMorgansBidding extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'scion-shuttle#at-morgans-bidding-id',
            internalName: 'scion-shuttle#at-morgans-bidding',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addConstantAbility({
            title: 'While this unit is attacking, the defending unit gets -1/-1',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isDefending() && card.activeAttack.attacker === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 })
        });
    }
}
