import AbilityHelper from '../../AbilityHelper';
import { Card } from '../../core/card/Card';
import { PlayableCard } from '../../core/card/CardTypes';
import { LeaderUnitCard } from '../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, Trait } from '../../core/Constants';
import { StateWatcherRegistrar } from '../../core/stateWatcher/StateWatcherRegistrar';
import { CardsPlayedThisPhaseWatcher } from '../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class GrandMoffTarkinOversectorGovernor extends LeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '2579145458',
            internalName: 'luke-skywalker#faithful-friend',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Give a shield to a heroism unit you played this phase',
            cost: [AbilityHelper.costs.abilityResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => {
                    if (!card.hasSomeAspect(Aspect.Heroism)) {
                        return false;
                    }

                    const playedThisTurn = this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) => playedCardEntry.playedBy === context.source.controller);
                    return playedThisTurn.includes(card);
                },
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Give a shield token to another unit',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}

GrandMoffTarkinOversectorGovernor.implemented = true;
