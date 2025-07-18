import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import * as Contract from '../../../core/utils/Contract';


export default class GuardianOfTheWhills extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4166047484',
            internalName: 'guardian-of-the-whills'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    private isFirstUpgradePlayedOnThisCopy(card: Card, adjusterSource: Card): boolean {
        Contract.assertTrue(adjusterSource.isUnit());

        return !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.card.isUpgrade() &&
            playedCardEntry.parentCard === adjusterSource &&
            playedCardEntry.parentCardInPlayId === adjusterSource.inPlayId
        );
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'The first upgrade you play on this unit each round costs 1 resource less.',
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                amount: 1,
                match: (card, adjusterSource) => card.isUpgrade() && this.isFirstUpgradePlayedOnThisCopy(card, adjusterSource),
                attachTargetCondition: (attachTarget, adjusterSource) => attachTarget === adjusterSource,
                limit: AbilityHelper.limit.perRound(1),
            }),
        });
    }
}
