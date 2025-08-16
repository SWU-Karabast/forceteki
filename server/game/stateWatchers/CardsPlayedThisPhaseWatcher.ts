import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType, ZoneName } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface PlayedCardEntry {
    card: GameObjectRef<IPlayableCard>;
    // playEvent: any;
    playEventId: number;
    originalZone?: ZoneName;
    inPlayId?: number;
    playedBy: GameObjectRef<Player>;
    parentCard?: GameObjectRef<IInPlayCard>;
    parentCardInPlayId?: number;
    hasWhenDefeatedAbilities?: boolean;
    playedAsType: CardType;
}

export class CardsPlayedThisPhaseWatcher extends StateWatcher<PlayedCardEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.CardsPlayedThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: PlayedCardEntry[]): UnwrapRef<PlayedCardEntry[]> {
        return stateValue.map((x) => ({ ...x, card: this.game.getFromRef(x.card), playedBy: this.game.getFromRef(x.playedBy), parentCard: this.game.getFromRef(x.parentCard) }));
    }

    /**
     * Returns an array of {@link PlayedCardEntry} objects representing every card played
     * in this phase so far and the player who played that card
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    /** Filters the list of played cards in the state and returns the cards that match */
    public getCardsPlayed(filter: (entry: UnwrapRef<PlayedCardEntry>) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    /** Check the list of played cards in the state if we found cards that match filters */
    public someCardPlayed(filter: (entry: UnwrapRef<PlayedCardEntry>) => boolean): boolean {
        return this.getCardsPlayed(filter).length > 0;
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: PlayedCardEntry[], event: any) =>
                currentState.concat({
                    card: event.card.getRef(),
                    playEventId: event.eventId,
                    originalZone: event.originalZone,
                    parentCard: event.card.isUpgrade() && event.card.isAttached() ? event.card.parentCard.getRef() : null,
                    parentCardInPlayId: event.card.isUpgrade() && event.card.parentCard?.canBeInPlay() ? event.card.parentCard.inPlayId : null,
                    inPlayId: event.card.inPlayId ?? null,
                    playedBy: event.player.getRef(),
                    hasWhenDefeatedAbilities: event.card.canBeInPlay() && event.card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated),
                    playedAsType: event.card.type,
                })
        });
    }

    protected override getResetValue(): PlayedCardEntry[] {
        return [];
    }
}
