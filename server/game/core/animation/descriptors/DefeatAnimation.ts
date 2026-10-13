import { EventName } from '../../Constants';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';

export const defeatAnimation: IAnimationDescriptor = {
    name: 'defeat',
    kinds: [AnimationKind.Defeat],
    when: {
        // Every defeat is recorded — units, upgrades, tokens (shields, Force, Credits) and
        // resources alike. Which of those to animate, and how, is the client's decision.
        [EventName.OnCardDefeated]: (event) => event?.isResolved,
    },
    build: (event) => ({
        kind: AnimationKind.Defeat,
        card: event.card.uuid,
    }),
    // A defeated card is either in play or one of its controller's resources, and it ends up in the
    // discard pile, out of the game (tokens) or back on the base (deployed leaders) — all public.
    // The record carries only its uuid, so it reveals nothing the next game state does not.
    summarizeFor: (record) => record,
};
