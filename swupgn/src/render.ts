import type { SwuPgnDocument, GameEvent, Seat } from './types';
import { baseId, NameResolver } from './cardNames';

function who(p: Seat | undefined): string {
    return p === 1 ? 'Player 1' : p === 2 ? 'Player 2' : '';
}

function isTopLevelAction(e: GameEvent): boolean {
    return e.t === 'PLAY' || e.t === 'PLAY_EVENT' || e.t === 'PLAY_UPGRADE' ||
        e.t === 'PLAY_SMUGGLE' || e.t === 'DEPLOY_LEADER' || e.t === 'ATTACK' ||
        e.t === 'PASS' || e.t === 'CLAIM_INITIATIVE';
}

/** Normative one-line rendering of a single event. */
function line(e: GameEvent, n: NameResolver): string | null {
    const nm = (id: string) => n.nameOf(baseId(id));
    switch (e.t) {
        case 'PLAY': case 'PLAY_UPGRADE': case 'PLAY_SMUGGLE':
            return `${who(e.p)} plays ${nm(e.card)}${e.zone ? ` to ${e.zone}` : ''}${e.cost != null ? ` (cost ${e.cost})` : ''}`;
        case 'PLAY_EVENT': return `${who(e.p)} plays ${nm(e.card)}${e.cost != null ? ` (cost ${e.cost})` : ''}`;
        case 'DEPLOY_LEADER': return `${who(e.p)} deploys ${nm(e.card)}${e.zone ? ` to ${e.zone}` : ''}`;
        case 'ATTACK': return `${who(e.p)} attacks ${e.defenderType === 'base' ? `${who(e.p === 1 ? 2 : 1)}'s base` : nm(e.def)} with ${nm(e.atk)}`;
        case 'PASS': return `${who(e.p)} passes`;
        case 'CLAIM_INITIATIVE': return `${who(e.p)} claims initiative and passes`;
        case 'DAMAGE': return `${nm(e.src)} deals ${e.amt} damage to ${e.tgt.startsWith('base@') ? `Player ${e.tgt.slice(5)}'s base` : nm(e.tgt)} (${e.hp} remaining HP)`;
        case 'HEAL': return `${e.amt} damage healed from ${e.tgt.startsWith('base@') ? `Player ${e.tgt.slice(5)}'s base` : nm(e.tgt)} (${e.hp} remaining HP)`;
        case 'DEFEAT': return `${nm(e.card)} is defeated${e.defeatedBy ? ` by ${nm(e.defeatedBy)}` : ''}`;
        case 'EXHAUST': return `${nm(e.card)} is exhausted`;
        case 'READY': return `${nm(e.card)} is readied`;
        case 'OVERWHELM': return `${e.amt} Overwhelm damage dealt to ${who(e.p === 1 ? 2 : 1)}'s base (${e.hp} remaining HP)`;
        case 'DRAW': return `${who(e.p)} draws ${e.count} card${e.count === 1 ? '' : 's'}: ${e.cards.map(nm).join(', ')}`;
        case 'RESOURCE': return `${who(e.p)} resources ${nm(e.card)}`;
        case 'REVEAL': return `${who(e.p)}'s ${e.zone} revealed: ${e.cards.map(nm).join(', ')}`;
        case 'SEARCH': return e.found ? `${who(e.p)} finds ${e.found.map(nm).join(', ')}` : `${who(e.p)} searches their deck`;
        case 'CREATE_TOKEN': return `${who(e.p)} creates ${nm(e.token)} in ${e.zone}`;
        case 'MULLIGAN': return `${who(e.p)} mulligans`;
        case 'KEEP_HAND': return `${who(e.p)} keeps their hand`;
        case 'TRIGGER': return `${nm(e.card)} triggers`;
        case 'CHOICE': case 'PHASE_END': case 'ROUND_END': case 'SHUFFLE':
        case 'MODAL_CHOICE': case 'ABILITY_ACTIVATE': case 'DISCARD': case 'MOVE':
        case 'CAPTURE': case 'RESCUE': case 'TAKE_CONTROL': case 'SHIELD_GAIN':
        case 'SHIELD_USE': case 'EXPERIENCE_GAIN': case 'STATUS_TOKEN':
            return null;   // not part of the human story (or covered by their parent action)
        case 'PHASE_START': return null;       // handled as a banner below
        case 'ROUND_START': return null;       // handled as a banner below
        case 'GAME_END': return `${e.winner === 'Draw' ? 'Game ends in a draw' : `${who(e.winner)} wins`} (${e.reason})`;
        default: { const _exhaustive: never = e; void _exhaustive; return null; }
    }
}

export function render(doc: SwuPgnDocument, n: NameResolver): string {
    const out: string[] = [];
    let actionNum = 0;
    for (const e of doc.events) {
        if (e.t === 'ROUND_START') { out.push('', `═══ ROUND ${e.round} ═══`, ''); actionNum = 0; continue; }
        if (e.t === 'PHASE_START') { out.push(`─── ${e.phase} ───`); actionNum = 0; continue; }
        const text = line(e, n);
        if (text == null) { continue; }
        if (isTopLevelAction(e)) { actionNum += 1; out.push(`${actionNum}. ${text}`); }
        else { out.push(text); }
    }
    return out.join('\n');
}
