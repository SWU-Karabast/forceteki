import { EventName } from '../../Constants';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';
import { isAnimatableDefeatTarget } from '../AnimationHelpers';

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
