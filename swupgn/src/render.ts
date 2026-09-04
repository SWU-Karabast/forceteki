import type { SwuPgnDocument, GameEvent, ReducedState, Seat } from './types';
import { baseId, NameResolver, indexResolver } from './cardNames';

const RULE_WIDTH = 78;

function who(p: Seat | undefined): string {
    return p === 1 ? 'Player 1' : p === 2 ? 'Player 2' : '';
}

/**
 * Events a player CHOSE to do. These get a number; everything else is a consequence of the
 * numbered action above it and is printed indented underneath.
 *
 * This mirrors the `seq` scheme, where a top-level action is `R2.A.3` and its consequences
 * are `R2.A.3a`, `R2.A.3b`, … — the causal grouping is already in the data, and indenting
 * is what makes it visible.
 */
function isTopLevelAction(e: GameEvent): boolean {
    return e.t === 'PLAY' || e.t === 'PLAY_EVENT' || e.t === 'PLAY_UPGRADE' ||
        e.t === 'PLAY_SMUGGLE' || e.t === 'DEPLOY_LEADER' || e.t === 'ATTACK' ||
        e.t === 'PASS' || e.t === 'CLAIM_INITIATIVE';
}

/** Normative one-line rendering of a single event. `null` means "not part of the story". */
function line(e: GameEvent, n: NameResolver): string | null {
    const nm = (id: string) => {
        if (typeof id === 'string' && id.startsWith('base@')) {
            return `${who(Number(id.slice(5)) as Seat)}'s base`;
        }
        return n.nameOf(baseId(id)) + copySuffix(id);
    };
    switch (e.t) {
        case 'PLAY': case 'PLAY_UPGRADE': case 'PLAY_SMUGGLE':
            return `${who(e.p)} plays ${nm(e.card)}${e.zone ? ` to ${e.zone}` : ''}${e.cost != null ? ` (${e.cost} resources)` : ''}`;
        case 'PLAY_EVENT': return `${who(e.p)} plays ${nm(e.card)}${e.cost != null ? ` (${e.cost} resources)` : ''}`;
        case 'DEPLOY_LEADER': return `${who(e.p)} deploys ${nm(e.card)}`;
        case 'ATTACK': return `${who(e.p)} attacks ${e.defenderType === 'base' ? `${who(e.p === 1 ? 2 : 1)}'s base` : nm(e.def)} with ${nm(e.atk)}`;
        case 'PASS': return `${who(e.p)} passes`;
        case 'CLAIM_INITIATIVE': return `${who(e.p)} claims initiative`;
        case 'DAMAGE': return `${e.amt} damage to ${nm(e.tgt)} — ${e.hp} HP left`;
        case 'OVERWHELM': return `${e.amt} Overwhelm damage to ${who(e.p === 1 ? 2 : 1)}'s base — ${e.hp} HP left`;
        case 'HEAL': return `${e.amt} healed on ${nm(e.tgt)} — ${e.hp} HP left`;
        case 'DEFEAT': return `${nm(e.card)} is defeated${e.defeatedBy ? ` by ${nm(e.defeatedBy)}` : ''}`;
        case 'ABILITY_ACTIVATE': return `${nm(e.card)} uses an ability`;
        case 'TRIGGER': return `${nm(e.card)} triggers`;
        case 'STATUS_TOKEN': return `${nm(e.card)} ${e.count < 0 ? 'loses' : 'gains'} ${Math.abs(e.count)} ${e.token}`;
        case 'SHIELD_GAIN': return `${nm(e.card)} gains ${e.count ?? 1} shield`;
        case 'SHIELD_USE': return `${nm(e.card)} loses ${e.count ?? 1} shield`;
        case 'EXPERIENCE_GAIN': return `${nm(e.card)} ${e.count < 0 ? 'loses' : 'gains'} ${Math.abs(e.count)} experience`;
        case 'DRAW': return `${who(e.p)} draws ${e.count}${e.cards.length ? `: ${e.cards.map(nm).join(', ')}` : ''}`;
        case 'DISCARD': return `${who(e.p)} discards ${e.cards.map(nm).join(', ')}`;
        case 'RESOURCE': return `${who(e.p)} resources ${nm(e.card)}`;
        case 'REVEAL': return `${who(e.p)} reveals ${e.cards.map(nm).join(', ')}`;
        case 'SEARCH': return e.found ? `${who(e.p)} searches, finds ${e.found.map(nm).join(', ')}` : `${who(e.p)} searches their deck`;
        case 'CREATE_TOKEN': return `${who(e.p)} creates ${nm(e.token)} in ${e.zone}`;
        case 'CAPTURE': return `${who(e.p)} captures ${nm(e.card)}`;
        case 'RESCUE': return `${who(e.p)} rescues ${nm(e.card)}`;
        case 'TAKE_CONTROL': return `${who(e.p)} takes control of ${nm(e.card)}`;
        case 'MULLIGAN': return `${who(e.p)} mulligans`;
        case 'KEEP_HAND': return `${who(e.p)} keeps their hand`;
        case 'GAME_END': return `*** ${e.winner === 'Draw' ? 'Game ends in a draw' : `${who(e.winner)} wins`} — ${e.reason} ***`;
        // Mechanism, not story: these are how the board changes, and each is already implied
        // by the action it sits under. MOVE in particular is the fold's source of truth and
        // would triple the length of the narrative for no reader benefit.
        case 'CHOICE': case 'PHASE_END': case 'ROUND_END': case 'SHUFFLE':
        case 'MODAL_CHOICE': case 'MOVE': case 'EXHAUST': case 'READY':
            return null;
        case 'PHASE_START': return null;       // handled as a banner below
        case 'ROUND_START': return null;       // handled as a banner below
        default: { const _exhaustive: never = e; void _exhaustive; return null; }
    }
}

/** `"ASH#110:2"` -> `" #2"`, so two copies of a card are distinguishable in the prose. */
function copySuffix(ref: string): string {
    const m = /:(\d+)$/.exec(String(ref));
    return m ? ` #${m[1]}` : '';
}

/**
 * The board at a round boundary, from that round's keyframe — the single most useful thing
 * for a human, because it lets them re-sync their mental model without replaying deltas.
 * No new data: this is the keyframe the file already carries, laid out to be read.
 */
function boardSummary(k: ReducedState, n: NameResolver): string[] {
    const nm = (id: string) => n.nameOf(baseId(id)) + copySuffix(id);
    const out: string[] = [];
    for (const seat of [1, 2] as Seat[]) {
        const p = k.players[seat];
        if (!p) {
            out.push(` P${seat}  (not recorded)`);
            continue;
        }
        out.push(` P${seat}  base ${p.baseHp}/${p.baseMaxHp}   hand ${p.handSize}   resources ${p.resourcesReady}`);
        for (const zone of ['ground', 'space']) {
            const inZone = p.cards.filter((c) => c.zone === zone);
            if (inZone.length === 0) {
                continue;
            }
            const rendered = inZone.map((c) => {
                const bits: string[] = [];
                if (c.damage) {
                    bits.push(`${c.damage} dmg`);
                }
                if (c.exhausted) {
                    bits.push('exhausted');
                }
                if (c.shields) {
                    bits.push(`${c.shields} shield`);
                }
                if (c.experience) {
                    bits.push(`${c.experience} xp`);
                }
                for (const [token, count] of Object.entries(c.statusTokens ?? {})) {
                    bits.push(`${count} ${token}`);
                }
                for (const up of c.upgrades ?? []) {
                    bits.push(nm(up));
                }
                return nm(c.id) + (bits.length ? ` [${bits.join(', ')}]` : '');
            });
            out.push(`      ${zone}: ${rendered.join('  ·  ')}`);
        }
    }
    return out;
}

/**
 * Render the human-readable story of a game.
 *
 * `names` is optional: when omitted, the document's own `%%% CARDS` index is used, so a file
 * that carries one renders with real card names and needs no external card database.
 */
export function render(doc: SwuPgnDocument, names?: NameResolver): string {
    const n = names ?? indexResolver(doc.cards);
    const out: string[] = [];
    let actionNum = 0;
    for (const e of doc.events) {
        if (e.t === 'ROUND_START') {
            out.push('', '═'.repeat(RULE_WIDTH));
            const left = ` ROUND ${e.round}`;
            const right = e.keyframe?.initiative ? `initiative: ${who(e.keyframe.initiative)} ` : '';
            out.push(right ? left.padEnd(RULE_WIDTH - right.length) + right : left);
            if (e.keyframe) {
                out.push(...boardSummary(e.keyframe, n));
            }
            out.push('═'.repeat(RULE_WIDTH), '');
            actionNum = 0;
            continue;
        }
        if (e.t === 'PHASE_START') {
            out.push(` ── ${e.phase} ──`);
            actionNum = 0;
            continue;
        }
        const text = line(e, n);
        if (text == null) {
            continue;
        }
        if (isTopLevelAction(e)) {
            actionNum += 1;
            out.push(` ${String(actionNum).padStart(2)}. ${text}`);
        } else {
            out.push(`       ↳ ${text}`);
        }
    }
    return out.join('\n');
}
