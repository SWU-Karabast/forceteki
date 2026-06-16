import type { Header } from '../../../../swupgn/src/types';
import { saltedPlayerId, anonymizePlayerLabel } from './swuPgnIdentity';

export interface HeaderContext {
    gameId: string;
    date: string;            // ISO-8601 UTC
    format?: string;
    cardPool: string;
    engineVersion: string;   // "forceteki@<version>"
    seed: string;
    perspective: 'P1' | 'P2' | null;
    rounds: number;
    result: 'P1' | 'P2' | 'Draw' | 'Incomplete';
    reason: string;
    p1: { username: string; leader: string; base: string };
    p2: { username: string; leader: string; base: string };
}

export function buildHeader(ctx: HeaderContext): Header {
    return {
        game: 'SWU-PGN/1.1',
        gameId: ctx.gameId,
        date: ctx.date,
        format: ctx.format,
        cardPool: ctx.cardPool,
        engine: ctx.engineVersion,
        seed: ctx.seed,
        perspective: ctx.perspective,
        p1Id: saltedPlayerId(ctx.p1.username, ctx.gameId),
        p2Id: saltedPlayerId(ctx.p2.username, ctx.gameId),
        p1: anonymizePlayerLabel(1),
        p2: anonymizePlayerLabel(2),
        p1Leader: ctx.p1.leader, p1Base: ctx.p1.base,
        p2Leader: ctx.p2.leader, p2Base: ctx.p2.base,
        result: ctx.result, reason: ctx.reason, rounds: ctx.rounds,
    };
}
