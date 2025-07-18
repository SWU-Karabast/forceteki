import { logger } from '../logger';

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

/**
 * A simple implementation of IGameStatisticsTracker that logs actions to the console.
 * This is temporary and can be replaced with more robust tracking in the future.
 */
export class GameStatisticsLogger implements IGameStatisticsTracker {
    public trackCardMetric(
        metric: GameCardMetric,
        card: IGameStatisticsTrackable,
        player: IGameStatisticsTrackable
    ): void {
        logger.info(`[Statistics] Tracking card action: ${GameCardMetric[metric]}`, { player: player.trackingId, card: card.trackingId });
    }
}