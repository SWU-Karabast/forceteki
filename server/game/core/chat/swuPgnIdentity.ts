import { createHash, createHmac } from 'crypto';
import type { Seat } from '../../../../swupgn/src/types';

/**
 * Pseudonymous player id. A raw username is never emitted anywhere (spec §17).
 *
 * TWO schemes, and which one is in force depends on one environment variable:
 *
 * - `SWUPGN_ID_SECRET` set (PREFERRED, and what a server publishing files should use): an HMAC
 *   keyed by that secret. The id is genuinely non-reversible -- an attacker without the key
 *   cannot confirm a guess -- and the same player hashes the SAME across that server's games,
 *   so a consumer can group a player's history without ever learning who they are.
 *
 * - Unset (fallback): salted with the `GameId`. Ids cannot be joined across files, and nobody
 *   reading one casually sees a username -- but it is NOT resistant to a targeted guess. The
 *   salt is printed two lines above the id in the same header and usernames are low-entropy, so
 *   anyone holding the file and a candidate list can confirm a player by re-hashing.
 *
 * A reader cannot tell the two apart -- both are `sha256:<hex>` -- so this needs no format
 * change and no version bump. Consumers that attribute a file to an account should take the
 * seat from the authenticated delivery rather than from this id under either scheme.
 */
export function saltedPlayerId(username: string, salt: string): string {
    // An empty value is NOT a secret. `SWUPGN_ID_SECRET=` in a deploy config would otherwise be
    // falsy and silently fall back to the per-game salt, publishing confirmable ids from a
    // deployment that believes it is publishing HMACs -- and both schemes emit `sha256:`, so
    // nothing downstream could tell.
    const secret = process.env.SWUPGN_ID_SECRET || undefined;
    const hash = secret
        ? createHmac('sha256', secret).update(username)
        : createHash('sha256').update(`${salt}:${username}`);
    const digest = hash.digest('hex');
    return `sha256:${digest}`;
}

/**
 * Opaque, stable id for the MATCH a game belongs to.
 *
 * Derived from the lobby id rather than carrying it, for the same reason player names are
 * hashed: a replay is a shareable artifact and should not export the host's internal
 * identifiers. It is deliberately NOT salted per game -- the whole point is that every game of
 * one Bo3 produces the SAME value, so a file that travels on its own can still say which match
 * it came from. Lobby ids are UUIDs, so an unsalted hash is not meaningfully guessable.
 */
export function anonymizedMatchId(lobbyId: string): string {
    const digest = createHash('sha256')
        .update(`swupgn-match:${lobbyId}`)
        .digest('hex');
    return `sha256:${digest}`;
}

export function anonymizePlayerLabel(seat: Seat): string {
    return `Player ${seat}`;
}
