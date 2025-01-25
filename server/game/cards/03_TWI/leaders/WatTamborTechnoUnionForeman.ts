import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { WildcardCardType } from '../../../core/Constants';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class WatTamborTechnoUnionForeman extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1686059165',
            internalName: 'wat-tambor#techno-union-foreman',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'If a friendly unit was defeated this phase, give a unit +2/+2 for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: this.getWatTamborEffect()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'If a friendly unit was defeated this phase, give a unit +2/+2 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: this.getWatTamborEffect(),
            }
        });
    }

    private getWatTamborEffect(): GameSystem<TriggeredAbilityContext<this>> {
        return AbilityHelper.immediateEffects.conditional({
            condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.source.controller),
            onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
            }),
            onFalse: AbilityHelper.immediateEffects.noAction()
        });
    }
}
