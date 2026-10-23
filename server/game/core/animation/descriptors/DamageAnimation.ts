import { EventName } from '../../Constants';
import { DamageSystem } from '../../../gameSystems/DamageSystem';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';

export const damageAnimation: IAnimationDescriptor = {
    name: 'damage',
    kinds: [AnimationKind.Damage],
    when: {
        [EventName.OnDamageDealt]: (event) => event?.isResolved && event?.damageDealt > 0,
    },
    build: (event) => ({
        kind: AnimationKind.Damage,
        cardId: event.card.uuid,
        sourceCardIds: DamageSystem.getDamageSourceCards(event).map((card) => card.uuid),
        amount: event.damageDealt,
    }),
    summarizeFor: (record) => record,
};
