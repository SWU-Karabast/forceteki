import { createHash, createHmac } from 'crypto';
import type { Seat } from '../../../../swupgn/src/types';

/**
 * Pseudonymous player id, derived from the player's account id (spec §17). Neither the account id
 * nor a display name is ever emitted. A display name is not an identity: it can change hands, and
 * every guest without an id shares one.
 *
 * TWO schemes, and which one is in force depends on one environment variable:
 *
 * - `SWUPGN_ID_SECRET` set (PREFERRED, and what a server publishing files should use): an HMAC
 *   keyed by that secret. The id is genuinely non-reversible -- an attacker without the key
 *   cannot confirm a guess -- and the same account hashes the SAME across that server's games,
 *   so a consumer can group a player's history without ever learning who they are.
 *
 * - Unset (fallback): salted with the engine's internal game id. Ids cannot be joined across
 *   files, and nobody reading one casually sees an account id. The file does not print the salt
 *   (its `GameId` is a hash of it, `anonymizedGameId`), but the salt is NOT a secret: the server
 *   names the game by that id to the game's players and spectators, and logs it. So this mode
 *   gives no protection against anyone who took part in or watched the game. Only the HMAC is
 *   pseudonymous, which is why a deployment that publishes files must set the secret (spec §17).
 *
 * A reader cannot tell the two apart -- both are `sha256:<hex>` -- so this needs no format
 * change and no version bump. Consumers that attribute a file to an account should take the
 * seat from the authenticated delivery rather than from this id under either scheme.
 */
export function saltedPlayerId(accountId: string, salt: string): string {
    // An empty value is NOT a secret. `SWUPGN_ID_SECRET=` in a deploy config would otherwise be
    // falsy and silently fall back to the per-game salt, publishing confirmable ids from a
    // deployment that believes it is publishing HMACs -- and both schemes emit `sha256:`, so
    // nothing downstream could tell.
    const secret = process.env.SWUPGN_ID_SECRET || undefined;
    const hash = secret
        ? createHmac('sha256', secret).update(accountId)
        : createHash('sha256').update(`${salt}:${accountId}`);
    const digest = hash.digest('hex');
    return `sha256:${digest}`;
}

/**
 * The startup error to log when a production server would publish fallback-scheme ids (see
 * `saltedPlayerId`), or undefined when there is nothing to report.
 */
export function idSecretStartupError(env: NodeJS.ProcessEnv): string | undefined {
    if (env.ENVIRONMENT !== 'production' || env.SWUPGN_ID_SECRET) {
        return undefined;
    }
    return 'SWUPGN_ID_SECRET is not set: SWU-PGN player ids use the per-game salt fallback (see swuPgnIdentity.ts)';
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

/**
 * Opaque id for ONE game, written as `GameId`.
 *
 * The engine's game id is host-internal: it is in the server's logs next to the lobby and the
 * players, so publishing it would let anyone with log access tie a shared replay to accounts.
 * Spec §17 forbids that for `GameId` as it does for `Match`. Hashed with a different prefix from
 * `anonymizedMatchId` so a game id and a match id never collide.
 */
export function anonymizedGameId(gameId: string): string {
    const digest = createHash('sha256')
        .update(`swupgn-game:${gameId}`)
        .digest('hex');
    return `sha256:${digest}`;
}

export function anonymizePlayerLabel(seat: Seat): string {
    return `Player ${seat}`;
}
