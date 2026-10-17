import { EventName } from '../../Constants';
import type { IDamageSource } from '../../../IDamageOrDefeatSource';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';

export const damageAnimation: IAnimationDescriptor = {
    name: 'damage',
    kinds: [AnimationKind.Damage],
    when: {
        [EventName.OnDamageDealt]: (event) => event?.isResolved && event?.damageDealt > 0,
    },
    build: (event) => {
        const damageSource: IDamageSource = event.damageSource;

        return {
            kind: AnimationKind.Damage,
            cardId: event.card.uuid,
            // Narrowed by field rather than by `type`: the attack variant's `type` spans two enums.
            sourceCardIds: 'damageDealtBy' in damageSource
                ? damageSource.damageDealtBy.map((card) => card.uuid)
                : [damageSource.card?.uuid].filter((uuid) => uuid != null),
            amount: event.damageDealt,
        };
    },
    summarizeFor: (record) => record,
};
