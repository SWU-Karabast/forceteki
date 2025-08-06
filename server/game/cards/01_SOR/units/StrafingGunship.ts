import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, ZoneName, RelativePlayer } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class StrafingGunship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5464125379',
            internalName: 'strafing-gunship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit can attack units in the ground arena',
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.CanAttackGroundArenaFromSpaceArena)
        });

        registrar.addConstantAbility({
            title: 'While this unit is attacking a ground unit, the defender gets –2/–0.',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.targetIsUnit((card) => card.zoneName === ZoneName.GroundArena),
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card === context.source.activeAttack?.getSingleTarget(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
        });
    }
}
