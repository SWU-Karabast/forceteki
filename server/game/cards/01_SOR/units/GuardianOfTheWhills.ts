import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisRoundWatcher } from '../../../stateWatchers/CardsPlayedThisRoundWatcher';
import { Contract } from '../../../core/utils/Contract';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GuardianOfTheWhills extends NonLeaderUnitCard {
    private cardsPlayedThisRoundWatcher: CardsPlayedThisRoundWatcher;

    protected override getImplementationId() {
        return {
            id: '4166047484',
            internalName: 'guardian-of-the-whills'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisRoundWatcher = AbilityHelper.stateWatchers.cardsPlayedThisRound();
    }

    private isFirstUpgradePlayedOnThisCopy(card: Card, adjusterSource: Card): boolean {
        Contract.assertTrue(adjusterSource.isUnit());

        return !this.cardsPlayedThisRoundWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.card.isUpgrade() &&
            playedCardEntry.parentCard === adjusterSource &&
            playedCardEntry.parentCardInPlayId === adjusterSource.inPlayId
        );
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `The first upgrade you play on this unit each round costs ${TextHelper.resource(1)} less.`,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                amount: 1,
                match: (card, adjusterSource) => card.isUpgrade() && this.isFirstUpgradePlayedOnThisCopy(card, adjusterSource),
                attachTargetCondition: (attachTarget, _, adjusterSource) => attachTarget === adjusterSource,
                limit: AbilityHelper.limit.perRound(1),
            }),
        });
    }
}
