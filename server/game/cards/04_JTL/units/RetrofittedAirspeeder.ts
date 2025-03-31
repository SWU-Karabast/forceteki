import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, ZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class RetrofittedAirspeeder extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9667260960',
            internalName: 'retrofitted-airspeeder',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'This unit can attack space units',
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.CanAttackSpaceArenaFromGroundArena)
        });

        this.addConstantAbility({
            title: 'While attacking a space unit, this unit gets –1/–0',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.isTargetUnitWithCondition((card) => card.zoneName === ZoneName.SpaceArena),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
