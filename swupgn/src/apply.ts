import { SwuPgnError } from './errors.js';
import { lineOf } from './parse.js';
import { canonicalAttrs } from './attrOrder.js';
import type { Attrs, Audience, Board, Entity, EntityId, Seat, SwuPgnFile, SwuRecord } from './generated/types.js';

const FIXED_IDS = ['g', 'p1', 'p2'];

/** The board before the first record ([A-04]). */
export function emptyBoard(): Board {
    return { seq: null, entities: { g: { a: {} }, p1: { a: {} }, p2: { a: {} } } };
}

/** Copy a board, carrying its retired ids, so `applyRecord` can continue on the copy. */
export function cloneBoard(board: Board): Board {
    const copy: Board = JSON.parse(JSON.stringify(board));
    RETIRED.set(copy, new Set(retiredOf(board)));
    return copy;
}

/** Ids retired by `remove`, per board ([A-08], [A-15]). */
const RETIRED = new WeakMap<Board, Set<number>>();

function retiredOf(board: Board): Set<number> {
    let s = RETIRED.get(board);
    if (!s) {
        s = new Set();
        RETIRED.set(board, s);
    }
    return s;
}

function fail(code: string, message: string, line?: number): never {
    throw new SwuPgnError(code, line === undefined ? message : `${message} (line ${line})`, line);
}

function mergeAudience(a: Audience | undefined, b: Audience): Audience {
    if (a === 'all' || b === 'all') {
        return 'all';
    }
    const seats = new Set<Seat>([...(a ?? []), ...b]);
    return [...seats].sort((x, y) => x - y);
}

function setAttrs(entity: Entity, a: Attrs | undefined): void {
    if (!a) {
        return;
    }
    for (const [k, v] of Object.entries(a)) {
        if (k === '__proto__') {
            continue;   // never an attribute; assigning it would change the prototype
        }
        if (v === null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete entity.a[k];
        } else {
            entity.a[k] = v;
        }
    }
    entity.a = canonicalAttrs(entity.a);
}

function requireEntity(board: Board, id: EntityId | undefined, what: string, line?: number): Entity {
    const found = id === undefined ? undefined : Object.prototype.hasOwnProperty.call(board.entities, String(id)) ? board.entities[String(id)] : undefined;
    if (!found) {
        fail('unknown-entity', `${what} ${JSON.stringify(id)} does not exist`, line);
    }
    return found;
}

/** Put an entity's fields in the canonical order of the board schema. */
function ordered(e: Entity): Entity {
    return {
        ...(e.zone !== undefined ? { zone: e.zone } : {}),
        ...(e.owner !== undefined ? { owner: e.owner } : {}),
        ...(e.controller !== undefined ? { controller: e.controller } : {}),
        ...(e.parent !== undefined ? { parent: e.parent } : {}),
        ...(e.rel !== undefined ? { rel: e.rel } : {}),
        ...(e.card !== undefined ? { card: e.card } : {}),
        ...(e.to !== undefined ? { to: e.to } : {}),
        a: e.a,
    };
}

/**
 * Apply one record to a board, in place. To continue from a board, keep using the same Board
 * object (or `cloneBoard` it): the ids retired by `remove` live with that object, so a board
 * rebuilt by hand or from JSON will not throw `reused-id`.
 *
 * Apply one record to a board, in place (SPEC §9.2). Throws `unknown-entity`, `duplicate-entity` or
 * `reused-id` (SPEC §9.3). A record of a type this version does not know, or a line that is not an
 * object, changes nothing ([A-03]); the validator reports it.
 */
export function applyRecord(board: Board, record: SwuRecord, line?: number): void {
    if (typeof record !== 'object' || record === null || Array.isArray(record)) {
        return;
    }
    const at = line ?? lineOf(record);
    switch (record.t) {
        case 'create': {
            const key = String(record.e);
            if (retiredOf(board).has(record.e)) {
                fail('reused-id', `entity ${key} was removed and its id cannot be created again`, at);
            }
            if (Object.prototype.hasOwnProperty.call(board.entities, key)) {
                fail('duplicate-entity', `entity ${key} already exists`, at);
            }
            if (record.parent !== undefined) {
                requireEntity(board, record.parent, 'parent', at);
            }
            const e: Entity = {
                zone: record.zone, owner: record.owner, controller: record.controller, parent: record.parent, rel: record.rel,
                card: record.card, to: record.to ?? (record.card !== undefined ? 'all' : undefined), a: {},
            };
            setAttrs(e, record.a);
            board.entities[key] = ordered(e);
            return;
        }
        case 'set': {
            const e = requireEntity(board, record.e, 'entity', at);
            if (record.parent !== undefined && record.parent !== null) {
                requireEntity(board, record.parent, 'parent', at);
            }
            const fields = e as unknown as Record<string, unknown>;
            if (record.zone !== undefined) {
                fields.zone = record.zone;
            }
            if (record.owner !== undefined) {
                fields.owner = record.owner;
            }
            if (record.controller === null) {
                delete fields.controller;
            } else if (record.controller !== undefined) {
                fields.controller = record.controller;
            }
            if (record.parent === null) {
                delete fields.parent;
                delete fields.rel;
            } else {
                if (record.parent !== undefined) {
                    fields.parent = record.parent;
                }
                if (record.rel === null) {
                    delete fields.rel;
                } else if (record.rel !== undefined) {
                    fields.rel = record.rel;
                }
            }
            setAttrs(e, record.a);
            board.entities[String(record.e)] = ordered(e);
            return;
        }
        case 'remove': {
            if (FIXED_IDS.includes(String(record.e))) {
                fail('unknown-entity', `${String(record.e)} cannot be removed`, at);
            }
            requireEntity(board, record.e, 'entity', at);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete board.entities[String(record.e)];
            retiredOf(board).add(record.e);
            return;
        }
        case 'reveal': {
            if (FIXED_IDS.includes(String(record.e))) {
                fail('unknown-entity', `${String(record.e)} cannot be revealed`, at);
            }
            const e = requireEntity(board, record.e, 'entity', at);
            e.card = record.card;
            e.to = mergeAudience(e.to, record.to);
            board.entities[String(record.e)] = ordered(e);
            return;
        }
        case 'step':
            board.seq = record.seq;
            return;
        default:
            return;   // block, and any type this version does not know
    }
}

/**
 * Apply records in file order (SPEC §9.2). With `untilSeq`, stop after the `step` with that `seq`
 * ([A-17]); if the records never reach it, the board of the whole list is returned.
 */
export function apply(records: SwuRecord[], options?: { untilSeq?: number }): Board {
    const board = emptyBoard();
    const until = options?.untilSeq;
    for (const record of records) {
        applyRecord(board, record);
        if (until !== undefined && typeof record === 'object' && record !== null && record.t === 'step' && record.seq === until) {
            break;
        }
    }
    return board;
}

/** The board at step `seq` of a parsed file ([A-17]). */
export function boardAt(file: SwuPgnFile, seq: number): Board {
    return apply(file.records, { untilSeq: seq });
}
