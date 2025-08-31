import { EventName } from '../game/core/Constants';
import { EventRegistrar } from '../game/core/event/EventRegistrar';
import type { GameEvent } from '../game/core/event/GameEvent';
import type Game from '../game/core/Game';
import { GameObjectBase } from '../game/core/GameObjectBase';
import { registerState, undoArray } from '../game/core/GameObjectUtils';

export enum GameCardMetric {
    Played,
    Activated,
    Discarded,
    Drawn,
    Resourced
}

export interface IGameStatisticsTrackable {
    get trackingId(): string;
}

export interface IGameStatisticsTracker {
    get cardMetrics(): readonly TrackedGameCardMetric[];

    /**
     * Tracks a card metric in the game statistics.
     * @param metric - The type of card metric being tracked.
     * @param card - The card that the metric applies to.
     * @param player - The player that performed the action with the card.
     */
    trackCardMetric(
        metric: GameCardMetric,
        card: IGameStatisticsTrackable,
        player: IGameStatisticsTrackable
    ): void;
}

class TrackedGameCardMetric extends GameObjectBase {
    public readonly metric: GameCardMetric;
    public readonly card: string;
    public readonly player: string;

    public constructor(game: Game, metric: GameCardMetric, card: IGameStatisticsTrackable, player: IGameStatisticsTrackable) {
        super(game);

        this.metric = metric;
        this.card = card.trackingId;
        this.player = player.trackingId;
    }
}

/**
 * A simple implementation of IGameStatisticsTracker that logs actions to the console.
 * This is temporary and can be replaced with more robust tracking in the future.
 */
@registerState()
export class GameStatisticsLogger extends GameObjectBase implements IGameStatisticsTracker {
    private events: EventRegistrar;

    @undoArray()
    public accessor cardMetrics: readonly TrackedGameCardMetric[] = [];

    public constructor(game: Game) {
        super(game);

        this.events = new EventRegistrar(game, this);
        this.events.register([
            EventName.OnCardsDrawn,
            EventName.OnCardDiscarded,
            EventName.OnCardPlayed,
        ]);
    }

    public trackCardMetric(
        metric: GameCardMetric,
        card: IGameStatisticsTrackable,
        player: IGameStatisticsTrackable
    ): void {
        this.cardMetrics = [...this.cardMetrics, new TrackedGameCardMetric(this.game, metric, card, player)];
    }

    private onCardsDrawn(event) {
        if (!(event as GameEvent).isResolved) {
            return;
        }

        for (const card of event.cards) {
            this.trackCardMetric(
                GameCardMetric.Drawn,
                card,
                event.player
            );
        }
    }

    private onCardDiscarded(event) {
        if (!(event as GameEvent).isResolved) {
            return;
        }

        this.trackCardMetric(
            GameCardMetric.Discarded,
            event.card,
            event.card.owner
        );
    }

    private onCardPlayed(event) {
        if (!(event as GameEvent).isResolved) {
            return;
        }

        this.trackCardMetric(
            GameCardMetric.Played,
            event.card,
            event.player
        );
    }
}