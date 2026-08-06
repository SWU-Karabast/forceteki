import { EffectName } from '../core/Constants';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import type { IUnitsEnterPlayReadyForPlayerProperties } from '../core/playerEffect/UnitsEnterPlayReadyForPlayer';
import { UnitsEnterPlayReadyForPlayer } from '../core/playerEffect/UnitsEnterPlayReadyForPlayer';

export function unitsEnterPlayReady(properties: IUnitsEnterPlayReadyForPlayerProperties) {
    return OngoingEffectBuilder.player.static(
        EffectName.UnitsEnterPlayReady,
        // Clone the limit so each registration of the matcher gets its own counter.
        (game) => new UnitsEnterPlayReadyForPlayer(game, { ...properties, limit: properties.limit?.clone() })
    );
}
