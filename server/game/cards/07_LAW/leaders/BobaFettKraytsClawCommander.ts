import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';

export default class BobaFettKraytsClawCommander extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'boba-fett#krayts-claw-commander-id',
            internalName: 'boba-fett#krayts-claw-commander',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'You may exhaust Boba Fett. If you do, create a Credit token.',
            when: {
                onAttackCompleted: (event, context) =>
                    event.attack.attacker.controller === context.player &&
                    event.attack.attacker.hasSomeTrait(Trait.BountyHunter)
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                onTrue: AbilityHelper.immediateEffects.exhaust(),
            }),
            ifYouDo: {
                title: 'Create a Credit token',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Credit token',
            when: {
                onAttackCompleted: (event, context) =>
                    event.attack.attacker.controller === context.player &&
                    event.attack.attacker.hasSomeTrait(Trait.BountyHunter)
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                onTrue: AbilityHelper.immediateEffects.exhaust(),
            }),
            ifYouDo: {
                title: 'Create a Credit token',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
            }
        });
    }
}