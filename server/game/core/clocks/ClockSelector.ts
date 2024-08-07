import type Player from '../Player';
import { Byoyomi } from './Byoyomi';
import { ChessClock } from './ChessClock';
import { BasicClock } from './BasicClock';
import { Hourglass } from './Hourglass';
import { Timer } from './Timer';
import type { IClock } from './IClock';

export enum ClockType {
    NONE = 'none',
    TIMER = 'timer',
    CHESS = 'chess',
    HOURGLASS = 'hourglass',
    BYOYOMI = 'byoyomi'
}

export type ClockConfig = { type: ClockType; time: 0; periods: 0; timePeriod: 0 };

export function clockFor(player: Player, details?: ClockConfig): IClock {
    const time = (details?.time ?? 0) * 60;
    const periods = details?.periods ?? 0;
    const timePeriod = details?.timePeriod ?? 0;
    switch (details?.type) {
        case ClockType.TIMER:
            return new Timer(player, time, periods);
        case ClockType.CHESS:
            return new ChessClock(player, time);
        case ClockType.HOURGLASS:
            return new Hourglass(player, time);
        case ClockType.BYOYOMI:
            return new Byoyomi(player, time, periods, timePeriod);
        case ClockType.NONE:
        default:
            return new BasicClock(player, time, periods);
    }
}
