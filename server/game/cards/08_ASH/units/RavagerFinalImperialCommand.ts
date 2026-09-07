import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Arena } from '../../../core/Constants';
import { CardType, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

export default class RavagerFinalImperialCommand extends NonLeaderUnitCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4828998087',
            internalName: 'ravager#final-imperial-command',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhaseWatcher = abilityHelper.stateWatchers.cardsLeftPlayThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal damage equal to its power to a unit in the same arena',
            contextTitle: (context) => `Deal ${this.playedUnitPower(context)} damage to a unit in the ${EnumHelpers.arenaName(this.playedUnitArena(context))}`,
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player
            },
            targetResolver: {
                activePromptTitle: (context) =>
                    `Deal ${this.playedUnitPower(context)} damage to a unit in the ${EnumHelpers.arenaName(this.playedUnitArena(context))}`,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === this.playedUnitArena(context),
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: this.playedUnitPower(context),
                    source: context.event.card
                }))
            }
        });
    }

    /** The unit's power, whether it is currently in play or has just left play. */
    private playedUnitPower(context): number {
        const playedCard = context.event.card;
        if (playedCard.isInPlay()) {
            return playedCard.getPower();
        }
        return this.cardsLeftPlayThisPhaseWatcher.getMostRecentLeftPlayEntry(playedCard)?.power ?? playedCard.getPrintedPower();
    }

    /** The arena the played unit is in, or was in when it left play.*/
    private playedUnitArena(context): Arena {
        const playedCard = context.event.card;
        if (playedCard.isInPlay()) {
            return playedCard.zoneName;
        }
        const arena = this.cardsLeftPlayThisPhaseWatcher.getMostRecentLeftPlayEntry(playedCard)?.arena;
        return EnumHelpers.isArena(arena) ? arena : playedCard.defaultArena;
    }
}
