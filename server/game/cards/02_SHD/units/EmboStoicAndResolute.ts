import type { IAbilityHelper } from '../../../AbilityHelper';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class EmboStoicAndResolute extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '0518313150',
            internalName: 'embo#stoic-and-resolute'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'If the defender was defeated, heal up to 2 damage from a unit',
            attackerMustSurvive: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.cardsDefeatedThisPhaseWatcher),
                onTrue: AbilityHelper.immediateEffects.distributeHealingAmong({
                    amountToDistribute: 2,
                    controller: WildcardRelativePlayer.Any,
                    canChooseNoTargets: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    maxTargets: 1
                }),
            })
        });
    }
}
