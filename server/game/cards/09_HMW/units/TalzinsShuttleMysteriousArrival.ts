import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class TalzinsShuttleMysteriousArrival extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'talzins-shuttle#mysterious-arrival-id',
            internalName: 'talzins-shuttle#mysterious-arrival',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = abilityHelper.stateWatchers.cardsPlayedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 2 Weakness tokens to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => this.cardsPlayedThisPhaseWatcher.getCardsPlayed((entry) =>
                        entry.playedBy === context.player.opponent
                    ).length >= 2,
                    onTrue: abilityHelper.immediateEffects.giveWeakness({ amount: 2 })
                })
            }
        });
    }
}