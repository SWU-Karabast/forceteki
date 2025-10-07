import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { DamagePreventionType, RelativePlayer } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class CassianAndorLayLow extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'cassian-andor#lay-low-id',
            internalName: 'cassian-andor#lay-low',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is defending, the attacker gets -2/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && context.source.isDefending(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })

        });

        registrar.addDamagePreventionAbility({
            title: 'If an enemy card ability would do damage to this unit, prevent 2 of that damage',
            preventionType: DamagePreventionType.Reduce,
            onlyFromPlayer: RelativePlayer.Opponent,
            damageOfType: DamageSourceType.Ability,
            preventionAmount: 2
        });
    }
}