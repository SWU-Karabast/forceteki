import type { Card } from '../../card/Card';
import type { CardTypeFilter, ZoneFilter } from '../../Constants';

/**
 * Value of a {@link EffectName.LimitReadyDuringRegroup} effect: limits which of the affected player's exhausted
 * cards ready during the regroup phase's ready step. The player chooses which of the limited cards ready and the
 * rest stay exhausted.
 *
 * The limit is applied to the "candidates": the affected player's exhausted cards that would ready during the
 * ready step and that match `zoneFilter`, `cardTypeFilter` and `cardCondition`. Every other card readies normally.
 */
export interface IRegroupReadyLimitProperties {

    /** Zones of the cards subject to the limit (e.g. the arenas, so that unit cards used as resources aren't limited) */
    zoneFilter: ZoneFilter | ZoneFilter[];

    /** Card types subject to the limit (defaults to any card type) */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];

    /** Additional filter for the cards subject to the limit */
    cardCondition?: (card: Card) => boolean;

    /**
     * Number of candidates the player must ready. This must be the largest number of candidates that can be chosen
     * under the limit, since readying during the ready step is not optional. If it is at least the number of
     * candidates, all of them ready without a prompt.
     */
    numCardsFunc: (candidates: Card[]) => number;

    /** Whether `card` may be chosen to ready alongside the already chosen `selectedCards` */
    multiSelectCardCondition?: (card: Card, selectedCards: Card[]) => boolean;

    /** Title of the prompt shown to the affected player */
    activePromptTitle?: string | ((candidates: Card[]) => string);
}
