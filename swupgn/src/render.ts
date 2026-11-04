import { applyRecord, emptyBoard } from './apply.js';
import type { Board, BlockRecord, EntityId, SwuPgnFile } from './generated/types.js';

interface Item {
    id: number;
    parent?: number;
    line: string;
    round: unknown;
    step: number | null;
    children: Item[];
}

function join(parts: string[]): string {
    if (parts.length <= 1) {
        return parts.join('');
    }
    return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
}

function letters(n: number): string {
    let s = '';
    let k = n + 1;
    while (k > 0) {
        k--;
        s = String.fromCharCode(97 + (k % 26)) + s;
        k = Math.floor(k / 26);
    }
    return s;
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** Renders a file as plain text: one numbered line per top-level block, children indented and lettered. */
export function render(file: SwuPgnFile): string {
    const names = new Map<string, string>();
    for (const c of file.cards) {
        names.set(c.id, c.name);
    }
    const seat = (p: number | undefined): string => {
        if (p === undefined) {
            return 'A player';
        }
        const tag = file.header[`P${p}`];
        return tag !== undefined && tag !== '' ? tag : `Player ${p}`;
    };

    const board: Board = emptyBoard();
    const refName = (ref: EntityId): string => {
        if (ref === 'p1') {
            return seat(1);
        }
        if (ref === 'p2') {
            return seat(2);
        }
        const card = board.entities[String(ref)]?.card;
        if (card === undefined) {
            return 'a card';
        }
        return names.get(card) ?? card;
    };
    const refs = (ids: EntityId[] | undefined): string | undefined => (ids === undefined || ids.length === 0 ? undefined : join(ids.map(refName)));
    const one = (id: EntityId | undefined): string | undefined => (id === undefined ? undefined : refName(id));

    const describe = (b: BlockRecord): string => {
        const who = b.p === undefined ? undefined : seat(b.p);
        const subject = who ?? 'Someone';
        const src = one(b.src);
        const targets = refs(b.targets);
        const options = refs(b.options);
        const via = one(b.via);
        const n = b.amount;
        const cards = (): string => targets ?? (n === undefined ? 'cards' : plural(n, 'card', 'cards'));
        const text = b.text === undefined || b.text === '' ? '' : `: ${b.text}`;
        let s: string;
        switch (b.kind) {
            case 'play':
                s = `${subject} plays ${src ?? 'a card'}${targets ? ` on ${targets}` : ''}${n === undefined ? '' : ` for ${plural(n, 'resource', 'resources')}`}${via ? ` using ${via}` : ''}`;
                break;
            case 'deploy':
                s = `${subject} deploys ${src ?? 'a leader'}${targets ? ` onto ${targets}` : ''}`;
                break;
            case 'attack':
                s = `${subject} attacks${targets ? ` ${targets}` : ''}${src ? ` with ${src}` : ''}${via ? ` using ${via}` : ''}`;
                break;
            case 'ability':
                s = `${subject} uses ${src ? `${src}'s` : 'an'} ability${targets ? ` on ${targets}` : ''}${via ? ` granted by ${via}` : ''}`;
                break;
            case 'trigger':
                s = src ? `${who ? `${who}'s ` : ''}${src} triggers${targets ? ` on ${targets}` : ''}${via ? ` granted by ${via}` : ''}` : `${subject} resolves a triggered ability${targets ? ` on ${targets}` : ''}`;
                break;
            case 'damage':
                s = `${n === undefined ? 'Damage' : `${n} damage`} is dealt to ${targets ?? 'a target'}${src ? ` by ${src}` : ''}`;
                break;
            case 'heal':
                s = `${n === undefined ? 'Damage' : `${n} damage`} is healed from ${targets ?? 'a target'}${src ? ` by ${src}` : ''}`;
                break;
            case 'defeat':
                s = `${targets ?? 'A card'} ${b.targets && b.targets.length > 1 ? 'are' : 'is'} defeated${src ? ` by ${src}` : ''}`;
                break;
            case 'capture':
                s = `${subject} captures ${targets ?? 'a card'}${src ? ` with ${src}` : ''}${via ? ` using ${via}` : ''}`;
                break;
            case 'rescue':
                s = `${subject} rescues ${targets ?? 'a card'}`;
                break;
            case 'draw':
                s = `${subject} draws ${cards()}`;
                break;
            case 'discard':
                s = `${subject} discards ${cards()}`;
                break;
            case 'resource':
                s = `${subject} resources ${cards()}`;
                break;
            case 'search':
                s = `${subject} searches their deck${src ? ` with ${src}` : ''}${options ? `, seeing ${options}` : ''}${targets ? `, taking ${targets}` : ''}`;
                break;
            case 'look':
                s = `${subject} looks at ${cards()}`;
                break;
            case 'choice':
                s = `${subject} chooses${text}${targets ? ` ${targets}` : ''}${options ? ` from ${options}` : ''}`;
                return s + '.';
            case 'name':
                s = `${subject} names "${b.text ?? ''}"`;
                break;
            case 'shuffle':
                s = `${subject} shuffles their deck${targets ? ` with ${targets}` : ''}`;
                break;
            case 'pass':
                s = `${subject} passes`;
                break;
            case 'initiative':
                s = `${subject} takes the initiative`;
                break;
            case 'mulligan':
                s = `${subject} makes a mulligan decision`;
                break;
            case 'regroup':
                s = 'The regroup phase begins';
                break;
            case 'gameEnd':
                s = 'The game ends';
                break;
            default: {
                const bits = [src, targets && `targeting ${targets}`, options && `options ${options}`, via && `via ${via}`, n !== undefined ? String(n) : undefined].filter((x): x is string => !!x);
                s = `${who ? `${who}: ` : ''}${b.kind}${bits.length > 0 ? ` (${bits.join(', ')})` : ''}`;
                return s + text + '.';
            }
        }
        return s + '.';
    };

    // The step a block belongs to is the next step record that closes it.
    const stepAfter: number[] = new Array<number>(file.records.length).fill(0);
    let upcoming: number | undefined;
    for (let i = file.records.length - 1; i >= 0; i--) {
        const r = file.records[i];
        if (r.t === 'step') {
            upcoming = r.seq;
        }
        stepAfter[i] = upcoming ?? -1;
    }

    const byId = new Map<number, Item>();
    const top: Item[] = [];
    file.records.forEach((r, i) => {
        try {
            applyRecord(board, r);
        } catch {
            // A record the applier rejects must not stop the story; names fall back as usual.
        }
        if (r.t !== 'block') {
            return;
        }
        const item: Item = {
            id: r.id,
            parent: r.parent,
            line: describe(r),
            round: board.entities.g?.a.round,
            step: stepAfter[i] === -1 ? null : stepAfter[i],
            children: []
        };
        byId.set(r.id, item);
        const parent = r.parent === undefined ? undefined : byId.get(r.parent);
        if (parent) {
            if (parent.step !== item.step) {
                item.line = `${item.step === null ? '(after the last step)' : `(step ${item.step})`} ${item.line}`;
            }
            parent.children.push(item);
        } else {
            top.push(item);
        }
    });

    const out: string[] = [];
    const emit = (item: Item, depth: number, index: number): void => {
        const label = depth === 0 ? `${index + 1}.` : `${letters(index)}.`;
        out.push(`${'   '.repeat(depth)}${label} ${item.line}`);
        item.children.forEach((c, k) => emit(c, depth + 1, k));
    };
    let round: unknown = null;
    let step: number | null | undefined;
    let n = 0;
    for (const item of top) {
        if (item.round !== undefined && item.round !== null && item.round !== round) {
            round = item.round;
            out.push(`=== Round ${String(round)} ===`);
        }
        if (item.step !== step) {
            step = item.step;
            n = 0;
            out.push(step === null ? 'After the last step' : `Step ${step}`);
        }
        emit(item, 0, n++);
    }
    return out.length === 0 ? '' : out.join('\n') + '\n';
}
