import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class AsajjVentressCountDookusAssassin extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '3556557330',
            internalName: 'asajj-ventress#count-dookus-assassin',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'If you\'ve attacked with another Separatist unit this phase, this unit gets +3/+0 for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                    controller: context.source.controller,
                    filter: (attackEvent) =>
                        attackEvent.attacker.hasSomeTrait(Trait.Separatist) &&
                        (attackEvent.attacker !== context.source || attackEvent.attackerInPlayId !== context.source.inPlayId)
                }),
                onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 }),
                }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

AsajjVentressCountDookusAssassin.implemented = true;
