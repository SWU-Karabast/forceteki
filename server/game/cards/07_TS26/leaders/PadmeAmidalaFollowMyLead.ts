import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class PadmeAmidalaFollowMyLead extends LeaderUnitCard {
    private unitsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1739137124',
            internalName: 'padme-amidala#follow-my-lead',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Attack with a friendly unit that entered play this phase even if it\'s exhausted. It can\'t attack bases for this attack',
            cost: abilityHelper.costs.exhaustSelf(),
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.friendlyUnitsEnteredPlayThisPhaseCount(context) >= 2,
                onTrue: abilityHelper.immediateEffects.selectCard({
                    cardCondition: (card, context) => card.isUnit() && this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) =>
                        entry.card.controller === context.player &&
                        entry.playedBy === context.player &&
                        entry.card.isInPlay()
                    ).includes(card),
                    immediateEffect: abilityHelper.immediateEffects.attack({
                        targetCondition: (target) => target.isUnit(),
                        allowExhaustedAttacker: true,
                    })
                })
            }),
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addWhenAttackEndsAbility({
            title: 'Attack with a friendly unit that entered play this phase even if it\'s exhausted. It can\'t attack bases for this attack',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) =>
                    card !== context.source &&
                    card.canBeInPlay() &&
                    this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) =>
                        entry.card.controller === context.player
                    ).includes(card),
                immediateEffect: abilityHelper.immediateEffects.attack({
                    targetCondition: (target) => target.isUnit(),
                    allowExhaustedAttacker: true,
                })
            }
        });
    }

    private friendlyUnitsEnteredPlayThisPhaseCount(context: AbilityContext): number {
        return this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) =>
            entry.playedBy === context.player
        ).length;
    }
}
