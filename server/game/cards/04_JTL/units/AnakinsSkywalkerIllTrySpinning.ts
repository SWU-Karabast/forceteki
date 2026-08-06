import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, TargetMode } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';

export default class AnakinsSkywalkerIllTrySpinning extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8523415830',
            internalName: 'anakin-skywalker#ill-try-spinning',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Return this upgrade to its owner\'s hand',
            when: {
                onAttackEnd: (event, context) => event.attack.attacker === context.source.parentCard,
            },
            targetResolver: {
                mode: TargetMode.Select,
                condition: (context) => AttackHelpers.attackerSurvived(context.event.attack, this.cardsDefeatedThisPhaseWatcher),
                choices: (context) => ({
                    [`Return ${context.source.title} to your hand`]: AbilityHelper.immediateEffects.returnToHand({
                        target: context.source,
                    }),
                    [`Keep ${context.source.title} attached`]: AbilityHelper.immediateEffects.noAction({
                        hasLegalTarget: true,
                    })
                })
            }
        });
    }
}
