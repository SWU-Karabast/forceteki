import { SwuPgnError } from '../errors.js';
import { canonicalAttrs } from '../attrOrder.js';
import type { Attrs, AttrValue, Audience, Board, CreateRecord, Entity, RemoveRecord, RevealRecord, Seat, SetRecord, SwuRecord } from '../generated/types.js';

const FIXED = ['g', 'p1', 'p2'];

function fail(message: string): never {
    // `result-mismatch`: the records that would turn `prev` into `next` do not exist, so applying
    // them cannot give `next` (SPEC [A-09]: a reveal only widens an audience).
    throw new SwuPgnError('result-mismatch', message);
}

function has(o: object, k: string): boolean {
    return Object.prototype.hasOwnProperty.call(o, k);
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }
    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => has(b, k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function seatsOf(a: Audience | undefined): Seat[] {
    return a === undefined || a === 'all' ? [] : [...a];
}

/** Ids: g, p1, p2 first, then ascending numeric. */
function sortedIds(board: Board): string[] {
    const fixed = FIXED.filter((k) => has(board.entities, k));
    const numeric = Object.keys(board.entities).filter((k) => !FIXED.includes(k))
        .sort((x, y) => Number(x) - Number(y));
    return [...fixed, ...numeric];
}

function attrChanges(prev: Attrs, next: Attrs): Attrs {
    const out: Attrs = {};
    for (const [k, v] of Object.entries(next)) {
        if (!has(prev, k) || !deepEqual(prev[k], v)) {
            out[k] = v;
        }
    }
    for (const k of Object.keys(prev)) {
        if (!has(next, k)) {
            out[k] = null;
        }
    }
    return canonicalAttrs(out as Record<string, AttrValue>);
}

function createRecord(id: string, e: Entity): CreateRecord {
    return {
        t: 'create',
        e: Number(id),
        ...(e.zone !== undefined ? { zone: e.zone } : {}),
        owner: e.owner as Seat,
        ...(e.controller !== undefined ? { controller: e.controller } : {}),
        ...(e.parent !== undefined ? { parent: e.parent, rel: e.rel } : {}),
        ...(e.card !== undefined ? { card: e.card } : {}),
        ...(e.to !== undefined ? { to: e.to } : {}),
        ...(Object.keys(e.a).length > 0 ? { a: canonicalAttrs(e.a) } : {}),
    };
}

function revealRecord(id: string, prev: Entity, next: Entity): RevealRecord | undefined {
    if (prev.card !== undefined && next.card !== prev.card) {
        fail(`entity ${id} changes its known card ${prev.card} to ${String(next.card)}; a reveal cannot change a known card`);
    }
    const gained = prev.card === undefined && next.card !== undefined;
    if (next.card === undefined) {
        if (!deepEqual(prev.to, next.to)) {
            fail(`entity ${id} changes its audience without a card; a reveal needs a card`);
        }
        return undefined;
    }
    if (prev.to === 'all' && next.to !== 'all') {
        fail(`entity ${id} narrows its audience from "all"; applying records can only widen an audience`);
    }
    if (next.to === undefined) {
        if (gained) {
            fail(`entity ${id} gains a card without an audience`);
        }
        return undefined;
    }
    let to: Audience;
    if (next.to === 'all') {
        if (prev.to === 'all') {
            return undefined;
        }
        to = 'all';
    } else {
        const before = seatsOf(prev.to);
        const after = next.to;
        const dropped = before.filter((s) => !after.includes(s));
        if (dropped.length > 0) {
            fail(`entity ${id} narrows its audience, dropping seat ${dropped.join(', ')}; applying records can only widen an audience`);
        }
        const added = after.filter((s) => !before.includes(s));
        if (added.length === 0 && !gained) {
            return undefined;
        }
        const widened = added.length > 0 ? added : after;
        to = [...widened].sort((x, y) => x - y);
    }
    return { t: 'reveal', e: Number(id), card: next.card, to };
}

function setRecord(id: string, prev: Entity, next: Entity): SetRecord | undefined {
    const fixed = FIXED.includes(id);
    const r: SetRecord = { t: 'set', e: fixed ? (id as 'g' | 'p1' | 'p2') : Number(id) };
    let changed = false;
    if (!fixed) {
        if (next.zone !== prev.zone) {
            if (next.zone === undefined) {
                fail(`entity ${id} loses its zone; a set cannot remove a zone`);
            }
            r.zone = next.zone;
            changed = true;
        }
        if (next.owner !== prev.owner) {
            if (next.owner === undefined) {
                fail(`entity ${id} loses its owner; a set cannot remove an owner`);
            }
            r.owner = next.owner;
            changed = true;
        }
        if (next.controller !== prev.controller) {
            r.controller = next.controller === undefined ? null : next.controller;
            changed = true;
        }
        if (next.parent !== prev.parent || next.rel !== prev.rel) {
            if (next.parent === undefined) {
                r.parent = null;
                r.rel = null;
            } else {
                if (next.rel === undefined) {
                    fail(`entity ${id} has a parent and no rel`);
                }
                r.parent = next.parent;
                r.rel = next.rel;
            }
            changed = true;
        }
    }
    const a = attrChanges(prev.a, next.a);
    if (Object.keys(a).length > 0) {
        r.a = a;
        changed = true;
    }
    return changed ? r : undefined;
}

/** Visit ids so that `before(id)` (when it names another id in the set) comes first. */
function topological(ids: string[], before: (id: string) => string | undefined): string[] {
    const set = new Set(ids);
    const done = new Set<string>();
    const out: string[] = [];
    const visit = (id: string): void => {
        if (done.has(id)) {
            return;
        }
        done.add(id);
        const dep = before(id);
        if (dep !== undefined && set.has(dep)) {
            visit(dep);
        }
        out.push(id);
    };
    ids.forEach(visit);
    return out;
}

/**
 * The records that turn the board `prev` into the board `next` (SPEC §7, §9): applying them to
 * `prev` with `applyRecord` gives `next`. A writer snapshots its board at each player decision and
 * writes `diff(prev, next)`.
 *
 * Order: `create`s (a parent before its children, otherwise ascending id), `reveal`s, `set`s
 * (`g`, `p1`, `p2` first, then ascending id), then `remove`s (children before their parent, [W-30]).
 * A reveal is written before the `set` that moves the card into a public zone ([W-44]). Every `set`
 * that carries `parent` carries `rel` ([W-34], [W-35]). Attribute keys are in canonical order.
 *
 * Limits: a diff of two decision-point boards cannot see an entity that is created and removed
 * inside one step ([W-37]): a card drawn and discarded, a token created and defeated. The writer
 * must write those records itself. The step's `seq` is not diffed: write `step` records yourself.
 *
 * Throws `SwuPgnError` `result-mismatch` when no records can give `next`: an audience narrows,
 * a known `card` changes or is dropped ([A-09]), or a fixed field would have to be removed.
 */
export function diff(prev: Board, next: Board): SwuRecord[] {
    const prevIds = new Set(Object.keys(prev.entities));
    const nextIds = new Set(Object.keys(next.entities));
    const created = sortedIds(next).filter((id) => !prevIds.has(id) && !FIXED.includes(id));
    const common = sortedIds(next).filter((id) => prevIds.has(id));
    const removed = sortedIds(prev).filter((id) => !nextIds.has(id) && !FIXED.includes(id));

    const records: SwuRecord[] = [];
    for (const id of topological(created, (i) => (next.entities[i].parent === undefined ? undefined : String(next.entities[i].parent)))) {
        records.push(createRecord(id, next.entities[id]));
    }
    for (const id of common) {
        if (!FIXED.includes(id)) {
            const r = revealRecord(id, prev.entities[id], next.entities[id]);
            if (r) {
                records.push(r);
            }
        }
    }
    for (const id of common) {
        const r = setRecord(id, prev.entities[id], next.entities[id]);
        if (r) {
            records.push(r);
        }
    }
    // a child leaves before its parent: visit the parent only after every removed child
    const kids = new Map<string, string[]>();
    for (const id of removed) {
        const p = prev.entities[id].parent;
        if (p !== undefined) {
            kids.set(String(p), [...(kids.get(String(p)) ?? []), id]);
        }
    }
    const emitted = new Set<string>();
    const removeWithChildren = (id: string): void => {
        if (emitted.has(id)) {
            return;
        }
        emitted.add(id);
        (kids.get(id) ?? []).forEach(removeWithChildren);
        const r: RemoveRecord = { t: 'remove', e: Number(id) };
        records.push(r);
    };
    removed.forEach(removeWithChildren);
    return records;
}
