import type { Attrs, Audience, Board, Entity, Seat } from '../../src/generated/types';
import { canonicalAttrs } from '../../src/attrOrder';

/** A small deterministic PRNG (mulberry32): the same seed always gives the same boards. */
export class Rng {
    private state: number;

    public constructor(seed: number) {
        this.state = seed >>> 0;
    }

    public next(): number {
        this.state = (this.state + 0x6D2B79F5) >>> 0;
        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    public int(n: number): number {
        return Math.floor(this.next() * n);
    }

    public chance(p: number): boolean {
        return this.next() < p;
    }

    public pick<T>(items: readonly T[]): T {
        return items[this.int(items.length)];
    }
}

const SEATS: Seat[] = [1, 2];
const CARDS = ['SOR#001', 'SOR#002', 'SHD#010', 'JTL#120'];
const ZONES = ['hand', 'discard', 'resource', 'ground', 'space'];
const RELS = ['attached', 'pilot'];

function randomAttrs(rng: Rng): Attrs {
    const a: Attrs = {};
    if (rng.chance(0.6)) {
        a.damage = rng.int(6);
    }
    if (rng.chance(0.5)) {
        a.exhausted = rng.chance(0.5);
    }
    if (rng.chance(0.4)) {
        a.power = rng.int(8);
    }
    if (rng.chance(0.3)) {
        a.keywords = rng.chance(0.5) ? ['Sentinel'] : ['Raid', 'Overwhelm'];
    }
    if (rng.chance(0.2)) {
        a.x_note = 'n' + rng.int(5);
    }
    return canonicalAttrs(a);
}

function randomAudience(rng: Rng): Audience {
    const r = rng.int(4);
    return r === 0 ? 'all' : r === 1 ? [1] : r === 2 ? [2] : [1, 2];
}

function randomEntity(rng: Rng): Entity {
    const e: Entity = { a: randomAttrs(rng) };
    e.zone = rng.pick(ZONES);
    e.owner = rng.pick(SEATS);
    if (rng.chance(0.3)) {
        e.controller = e.owner === 1 ? 2 : 1;
    }
    if (rng.chance(0.6)) {
        e.card = rng.pick(CARDS);
        e.to = randomAudience(rng);
    }
    return orderedEntity(e);
}

export function orderedEntity(e: Entity): Entity {
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

function attach(child: Entity, parentId: number, parent: Entity, rng: Rng): void {
    child.zone = parent.zone;
    child.parent = parentId;
    child.rel = rng.pick(RELS);
}

function widen(to: Audience, rng: Rng): Audience {
    if (to === 'all') {
        return to;
    }
    return rng.chance(0.5) ? 'all' : [1, 2];
}

function dropEntity(ents: Board['entities'], id: number): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete ents[String(id)];
}

/** A random board that is reachable by records: every parent exists, and sits in play with its child in the same zone. */
export function randomBoard(rng: Rng): Board {
    const entities: Board['entities'] = { g: { a: {} }, p1: { a: {} }, p2: { a: {} } };
    const count = 4 + rng.int(10);
    const parents: number[] = [];
    for (let id = 1; id <= count; id++) {
        const e = randomEntity(rng);
        if (rng.chance(0.3)) {
            e.zone = 'ground';
            parents.push(id);
        } else if (parents.length > 0 && rng.chance(0.35)) {
            const pid = rng.pick(parents);
            attach(e, pid, entities[String(pid)], rng);
        }
        entities[String(id)] = orderedEntity(e);
    }
    return { seq: null, entities };
}

/**
 * A board that follows `prev` by one decision: new parents with new children, children re-parented
 * or detached, parents removed with or without their children, attributes changed, added or deleted,
 * controllers changed and audiences widened. Never narrows an audience.
 */
export function nextBoard(prev: Board, rng: Rng): Board {
    const next: Board = JSON.parse(JSON.stringify(prev));
    const ents = next.entities;
    let nextId = Math.max(0, ...Object.keys(ents).filter((k) => (/^\d+$/).test(k))
        .map(Number)) + 1 + rng.int(3);
    const isNum = (k: string): boolean => (/^\d+$/).test(k);
    const ids = (): number[] => Object.keys(ents).filter(isNum)
        .map(Number);
    const inPlay = (): number[] => ids().filter((i) => ents[String(i)].zone === 'ground' && ents[String(i)].parent === undefined);

    // attributes, controller, reveal widening on random entities
    for (const id of ids()) {
        const e = ents[String(id)];
        if (rng.chance(0.3)) {
            const a: Attrs = { ...e.a };
            const roll = rng.int(3);
            if (roll === 0) {
                a.damage = rng.int(9);
            } else if (roll === 1) {
                a.x_other = rng.int(3);
            } else if (Object.keys(a).length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete a[rng.pick(Object.keys(a))];
            }
            e.a = canonicalAttrs(a);
        }
        if (rng.chance(0.15)) {
            if (e.controller === undefined) {
                e.controller = e.owner === 1 ? 2 : 1;
            } else if (rng.chance(0.5)) {
                delete e.controller;
            } else {
                e.controller = e.controller === 1 ? 2 : 1;
            }
        }
        if (e.card !== undefined && e.to !== undefined && rng.chance(0.25)) {
            e.to = widen(e.to, rng);
        } else if (e.card === undefined && e.parent === undefined && rng.chance(0.1)) {
            e.card = rng.pick(CARDS);
            e.to = randomAudience(rng);
        }
        if (e.parent === undefined && e.zone !== 'ground' && rng.chance(0.1)) {
            e.zone = rng.pick(['hand', 'discard', 'resource']);
        }
        ents[String(id)] = orderedEntity(e);
    }

    // fixed entities' attributes
    for (const fixed of ['g', 'p1', 'p2']) {
        if (rng.chance(0.5)) {
            const a: Attrs = { ...ents[fixed].a };
            const roll = rng.int(3);
            if (roll === 0) {
                a.round = rng.int(9);
            } else if (roll === 1) {
                a.credits = rng.int(5);
            } else {
                delete a.round;
            }
            ents[fixed].a = canonicalAttrs(a);
        }
    }

    // detach or re-parent children
    for (const id of ids()) {
        const e = ents[String(id)];
        if (e.parent !== undefined && rng.chance(0.3)) {
            if (rng.chance(0.5)) {
                delete e.parent;
                delete e.rel;
                e.zone = rng.pick(['hand', 'discard']);
            } else {
                const others = inPlay().filter((p) => p !== id);
                if (others.length > 0) {
                    const pid = rng.pick(others);
                    attach(e, pid, ents[String(pid)], rng);
                }
            }
            ents[String(id)] = orderedEntity(e);
        }
    }

    // remove parents, with their children removed or detached first
    for (const id of inPlay()) {
        if (rng.chance(0.2)) {
            const kids = ids().filter((k) => ents[String(k)].parent === id);
            for (const k of kids) {
                if (rng.chance(0.5)) {
                    dropEntity(ents, k);
                } else {
                    delete ents[String(k)].parent;
                    delete ents[String(k)].rel;
                    ents[String(k)].zone = 'discard';
                }
            }
            dropEntity(ents, id);
        }
    }
    // remove plain entities
    for (const id of ids()) {
        if (rng.chance(0.1) && !ids().some((k) => ents[String(k)].parent === id)) {
            dropEntity(ents, id);
        }
    }

    // a new parent with new children (children are created before the parent in id order half the time)
    if (rng.chance(0.7)) {
        const pid = nextId++;
        const parent = randomEntity(rng);
        parent.zone = rng.pick(['ground', 'space']);
        ents[String(pid)] = orderedEntity(parent);
        const kids = 1 + rng.int(2);
        for (let i = 0; i < kids; i++) {
            const child = randomEntity(rng);
            attach(child, pid, parent, rng);
            ents[String(nextId++)] = orderedEntity(child);
        }
    }
    // a new child of an existing parent, and new plain entities
    if (rng.chance(0.5) && inPlay().length > 0) {
        const pid = rng.pick(inPlay());
        const child = randomEntity(rng);
        attach(child, pid, ents[String(pid)], rng);
        ents[String(nextId++)] = orderedEntity(child);
    }
    for (let i = rng.int(3); i > 0; i--) {
        ents[String(nextId++)] = randomEntity(rng);
    }
    // an existing child gains an existing parent (re-parent onto a new entity is covered above)
    return next;
}

/** `count` reachable (prev, next) pairs from a seed. */
export function boardPairs(seed: number, count: number): { prev: Board; next: Board }[] {
    const rng = new Rng(seed);
    const out: { prev: Board; next: Board }[] = [];
    for (let i = 0; i < count; i++) {
        const prev = randomBoard(rng);
        out.push({ prev, next: nextBoard(prev, rng) });
    }
    return out;
}
