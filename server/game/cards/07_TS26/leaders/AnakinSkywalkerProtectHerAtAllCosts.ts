import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class AnakinSkywalkerProtectHerAtAllCosts extends LeaderUnitCard {
    private unitsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4956378430',
            internalName: 'anakin-skywalker#protect-her-at-all-costs',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Give a Shield token to a friendly unit that entered play this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                activePromptTitle: 'Give a Shield token to a unit that entered play this phase',
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) =>
                    card.canBeInPlay() &&
                    this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) =>
                        entry.card.controller === context.player &&
                        entry.playedBy === context.player &&
                        entry.card.isInPlay()
                    ).includes(card),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.friendlyUnitsEnteredPlayThisPhaseCount(context) >= 2,
                    onTrue: AbilityHelper.immediateEffects.giveShield()
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Give a Shield token to another friendly unit that entered play this phase',
            targetResolver: {
                activePromptTitle: 'Give a Shield token to another friendly unit that entered play this phase',
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) =>
                    card !== context.source &&
                    card.canBeInPlay() &&
                    this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) =>
                        entry.card.controller === context.player
                    ).includes(card),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }

    private friendlyUnitsEnteredPlayThisPhaseCount(context: AbilityContext): number {
        return this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) =>
            entry.playedBy === context.player
        ).length;
    }
}
