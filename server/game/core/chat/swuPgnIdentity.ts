import { createHash } from 'crypto';
import type { Seat } from '../../../../swupgn/src/types';

/**
 * Salted player id. Never emit a raw username anywhere.
 *
 * What this gives you: the same user gets a different id in every game (the salt is per-game),
 * so ids cannot be joined across files, and nobody reading a file casually sees a username.
 *
 * What it does NOT give you: resistance to a targeted guess. The salt in use is the gameId,
 * which is printed in the same header two lines above the id, and usernames are low-entropy.
 * Anyone holding the file and a candidate list (a scraped leaderboard, say) can confirm a
 * player by re-hashing `gameId:candidate`. If these files are ever published, swap the salt
 * for a server-side secret (HMAC) -- that is the change that makes the id genuinely
 * non-reversible, and it costs one env var.
 */
export function saltedPlayerId(username: string, salt: string): string {
    const digest = createHash('sha256').update(`${salt}:${username}`).digest('hex');
    return `sha256:${digest}`;
}

export function anonymizePlayerLabel(seat: Seat): string {
    return `Player ${seat}`;
}
