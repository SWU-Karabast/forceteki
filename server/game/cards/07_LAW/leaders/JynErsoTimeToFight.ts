import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class JynErsoTimeToFight extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4500960669',
            internalName: 'jyn-erso#time-to-fight',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Search the top 3 cards of your deck for a card and draw it',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf(),
            ],
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.friendlyRebelUnitWasDefeatedThisPhase(context),
                onTrue: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 3,
                    selectCount: 1,
                    revealSelected: false,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Search the top 3 cards of your deck for a card and draw it',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.friendlyRebelUnitWasDefeatedThisPhase(context),
                onTrue: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 3,
                    selectCount: 1,
                    revealSelected: false,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            })
        });
    }

    private friendlyRebelUnitWasDefeatedThisPhase(context: AbilityContext): boolean {
        return this.unitsDefeatedThisPhaseWatcher
            .someUnitDefeatedThisPhase((entry) =>
                entry.controlledBy === context.player &&
                entry.lastKnownInformation.traits.has(Trait.Rebel)
            );
    }
}