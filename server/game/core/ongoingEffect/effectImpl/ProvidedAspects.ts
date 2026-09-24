import type { Card } from '../../card/Card';
import type { Aspect } from '../../Constants';
import type { Player } from '../../Player';

/**
 * Resolves the aspects a card contributes to a player's aspect pool when
 * referenced by a "provides aspects" ongoing effect. If the card *is* that
 * player's deck-defined leader card, it contributes nothing here — those
 * aspects are already provided to the player by virtue of the deck's leader,
 * so re-providing them would double-count.
 */
export namespace ProvidedAspects {
    export function forCard(card: Card | null | undefined, player: Player): Aspect[] {
        if (!card) {
            return [];
        }
        if (card.isLeader() && player.getAllDeckLeaders().includes(card)) {
            return [];
        }
        return card.aspects;
    }
}
