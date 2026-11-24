import { EventName } from '../../Constants';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';

export const defeatAnimation: IAnimationDescriptor = {
    name: 'defeat',
    kinds: [AnimationKind.Defeat],
    when: {
        [EventName.OnCardDefeated]: (event) => event?.isResolved,
    },
    build: (event) => ({
        kind: AnimationKind.Defeat,
        cardId: event.card.uuid,
    }),
    summarizeFor: (record) => record,
};
