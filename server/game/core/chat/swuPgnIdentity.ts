import { createHash } from 'crypto';
import type { Seat } from '../../../../swupgn/src/types';

/**
 * Non-reversible, salted player id. The salt SHOULD be per-game (e.g. the gameId)
 * so the same user is unlinkable across games. Never emit a raw username anywhere.
 */
export function saltedPlayerId(username: string, salt: string): string {
    const digest = createHash('sha256').update(`${salt}:${username}`).digest('hex');
    return `sha256:${digest}`;
}

export function anonymizePlayerLabel(seat: Seat): string {
    return `Player ${seat}`;
}
