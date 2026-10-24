import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class AwakenedExogorth extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2900138286',
            internalName: 'awakened-exogorth',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is attacking, the defending unit gets -3/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isDefending() && card.activeAttack.attacker === context.source,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
        });
    }
}