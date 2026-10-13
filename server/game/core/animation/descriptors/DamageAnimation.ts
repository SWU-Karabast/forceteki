import { EventName } from '../../Constants';
import type { IDamageSource } from '../../../IDamageOrDefeatSource';
import { AnimationKind } from '../AnimationTypes';
import type { IAnimationDescriptor } from '../AnimationTypes';

export const damageAnimation: IAnimationDescriptor = {
    name: 'damage',
    kinds: [AnimationKind.Damage],
    when: {
        // `executeHandler` marks the event RESOLVED before `game.emit` fires, so this guard works
        // here and keeps cancelled/replaced events from producing phantom animations.
        [EventName.OnDamageDealt]: (event) => event?.isResolved && event?.damageDealt > 0,
    },
    build: (event) => {
        // `DamageSystem` sets this on every damage event: combat and overwhelm damage carry the
        // dealing units in `damageDealtBy`, ability and excess damage carry the card in `card`.
        // Narrowed by field rather than by `type`, since the attack variant's `type` spans two enums.
        const damageSource: IDamageSource = event.damageSource;

        return {
            kind: AnimationKind.Damage,
            target: event.card.uuid,
            sources: 'damageDealtBy' in damageSource
                ? damageSource.damageDealtBy.map((card) => card.uuid)
                : [damageSource.card?.uuid].filter((uuid) => uuid != null),
            // `damageDealt` is what actually landed, already capped at remaining HP. `amount` is what
            // was requested and can be larger — animating that would show damage that never happened.
            amount: event.damageDealt,
        };
    },
    // Damage only lands on cards in an arena or on a base, and neither zone is ever hidden from
    // either player, so there is nothing to withhold.
    summarizeFor: (record) => record,
};
