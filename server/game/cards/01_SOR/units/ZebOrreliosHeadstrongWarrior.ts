import AbilityHelper from '../../../AbilityHelper';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class ZebOrreliosHeadstrongWarrior extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9647945674',
            internalName: 'zeb-orrelios#headstrong-warrior'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'If the defender was defeated, you may deal 4 damage to a ground unit',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 4 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}
