import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamagePreventionType, RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';

export default class MalakiliLovingRancorKeeper extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4945479132',
            internalName: 'malakili#loving-rancor-keeper',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'The first Creature unit you play each phase costs 1 resource less',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => this.isFirstCreaturePlayedByControllerThisPhase(card),
                amount: 1,
                limit: AbilityHelper.limit.perRound(1)
            }),
        });

        registrar.addDamagePreventionAbility({
            title: 'If a friendly Creature unit would deal damage to a friendly unit, prevent that damage',
            preventionType: DamagePreventionType.All,
            shouldCardHaveDamagePrevention: (card, context) => this.isDamageFromFriendlyCreatureUnit(card, context),
        });
    }

    private isDamageFromFriendlyCreatureUnit(card, context) {
        const event = context.event;
        if (card.controller !== context.player) {
            return false;
        }
        if (event.damageSource.player !== context.player) {
            return false;
        }
        if (!event.damageSource.card?.isUnit()) {
            return false;
        }
        if (!event.damageSource.card?.hasSomeTrait(Trait.Creature)) {
            return false;
        }
        return true;
    }

    private isFirstCreaturePlayedByControllerThisPhase(card: Card) {
        return card.hasSomeTrait(Trait.Creature) &&
          !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
              playedCardEntry.playedBy === card.controller &&
              playedCardEntry.card.hasSomeTrait(Trait.Creature) &&
              playedCardEntry.card !== card
          );
    }
}
