import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, Location, RelativePlayer } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class StrafingGunship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5464125379',
            internalName: 'strafing-gunship',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'This unit can attack units in the ground arena',
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.CanAttackGroundArenaFromSpaceArena)
        });

        this.addConstantAbility({
            title: 'While this unit is attacking a ground unit, the defender gets –2/–0.',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.target.isUnit() && context.source.activeAttack?.target.location === Location.GroundArena,
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card === context.source.activeAttack?.target,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
        });
    }
}

StrafingGunship.implemented = true;
