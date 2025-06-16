import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class MalakiliLovingRancorKeeper extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4945479132',
            internalName: 'malakili#loving-rancor-keeper',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'The first Creature unit you play each phase costs 1 resource less',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => this.isFirstCreaturePlayedByControllerThisPhase(card),
                amount: 1,
                limit: AbilityLimit.perRound(1)
            }),
        });

        this.addReplacementEffectAbility({
            title: 'If a friendly Creature unit would deal damage to a friendly unit, prevent that damage',
            when: {
                onDamageDealt: (event, context) =>
                    event.card.controller === context.player &&
                    event.damageSource.player === context.player &&
                    event.damageSource.card?.isUnit() && event.damageSource.card?.hasSomeTrait(Trait.Creature)
            },
        });
    }

    private isFirstCreaturePlayedByControllerThisPhase(card) {
        return card.hasSomeTrait(Trait.Creature) &&
          !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
              playedCardEntry.playedBy === card.controller &&
              playedCardEntry.card.hasSomeTrait(Trait.Creature) &&
              playedCardEntry.card !== card
          );
    }
}
