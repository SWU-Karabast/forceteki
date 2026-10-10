import { EventName } from '../../Constants';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';
import { isAnimatableDefeatTarget, resolveDefeatSourceCard } from '../AnimationHelpers';

export const defeatAnimation: IAnimationDescriptor = {
    name: 'defeat',
    kinds: [AnimationKind.Defeat],
    when: {
        [EventName.OnCardDefeated]: (event) => event?.isResolved && isAnimatableDefeatTarget(event?.card),
    },
    build: (event) => {
        // By now the card has already been moved to discard by the event handler, so its live zone
        // and controller are useless. Last known information is the snapshot taken before it left.
        const lki = event.lastKnownInformation;

        return {
            kind: AnimationKind.Defeat,
            card: event.card.uuid,
            controller: lki?.controller?.id,
            arena: lki?.arena,
            reason: event.defeatSource?.type ?? 'unknown',
            defeatedBy: resolveDefeatSourceCard(event)?.uuid,
        };
    },
    // Defeated cards are in play (units, and upgrades attached to them), which both players can see.
    redact: (record) => record,
};
