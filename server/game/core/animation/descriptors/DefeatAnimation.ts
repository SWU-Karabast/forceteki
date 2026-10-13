import { EventName } from '../../Constants';
import type { Card } from '../../card/Card';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';

/**
 * A card being defeated is only worth animating if it is a real card on the board.
 *
 * Token UPGRADES (shield, experience, advantage, weakness) are removed by being defeated, so they
 * arrive here too — a shield popping is its own animation with its own host-tracking problem, so
 * it is deliberately out of v1. Force and Credit tokens likewise. Token UNITS are real bodies in
 * an arena and must keep their defeat animation.
 */
function isAnimatableDefeatTarget(card: Card | undefined): boolean {
    if (card == null) {
        return false;
    }
    return !card.isToken() || card.isTokenUnit();
}

export const defeatAnimation: IAnimationDescriptor = {
    name: 'defeat',
    kinds: [AnimationKind.Defeat],
    when: {
        [EventName.OnCardDefeated]: (event) => event?.isResolved && isAnimatableDefeatTarget(event?.card),
    },
    build: (event) => ({
        kind: AnimationKind.Defeat,
        card: event.card.uuid,
    }),
    // Defeated cards are in play (units, and upgrades attached to them), which both players can see.
    summarizeFor: (record) => record,
};
