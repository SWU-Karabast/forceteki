import { EventName } from '../../Constants';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';
import { resolveDamageSourceCard } from '../AnimationHelpers';

export const damageAnimation: IAnimationDescriptor = {
    name: 'damage',
    kinds: [AnimationKind.Damage],
    when: {
        // `executeHandler` marks the event RESOLVED before `game.emit` fires, so this guard works
        // here and keeps cancelled/replaced events from producing phantom animations.
        [EventName.OnDamageDealt]: (event) => event?.isResolved && event?.damageDealt > 0,
    },
    build: (event) => ({
        kind: AnimationKind.Damage,
        target: event.card.uuid,
        source: resolveDamageSourceCard(event)?.uuid,
        // `damageDealt` is what actually landed, already capped at remaining HP. `amount` is what
        // was requested and can be larger — animating that would show damage that never happened.
        amount: event.damageDealt,
        remainingHp: event.card.remainingHp,
        damageType: event.type,
        isLethal: !!event.willDefeat,
        isIndirect: event.isIndirect,
    }),
    // Damage only lands on cards in an arena or on a base, and neither zone is ever hidden from
    // either player, so there is nothing to withhold.
    redact: (record) => record,
};
