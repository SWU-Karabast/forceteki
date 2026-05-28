import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import { WildcardCardType } from '../../../core/Constants';

export default class RukhFromTheShadows extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'rukh#from-the-shadows-id',
            internalName: 'rukh#from-the-shadows',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Give 3 Advantage tokens to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                    onTrue: AbilityHelper.immediateEffects.giveAdvantage({ amount: 3 }),
                })
            }
        });
    }
}