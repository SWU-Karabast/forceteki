import type { Board, Entity, SwuRecord } from '@swupgn/format';
import { SwuPgnError } from '@swupgn/format';
import { diff } from '@swupgn/format/writer';

/**
 * The records that turn `prev` into `next`, like the package's `diff`, also when a parent changes zone between
 * the two boards while it has a child: a unit that changes arena with its upgrades, or a unit that enters play and
 * gets a token in the same event window. No single diff keeps [W-28] then, since the child must be in its parent's
 * zone after every record.
 *
 * Such boards are written in two passes through a middle board: first each kept child is detached (it keeps its old
 * zone) and each new child is left out, while the parents move; then the children are attached again, or created,
 * in their parents' new zone.
 *
 * `changed`, when given, names the entities that may differ between the boards: every other entity must be the same
 * object in both (the projector reused it), and is skipped. The records are the same as without it: an entity that is
 * the same object in both boards gives no record, and the only way it shapes the others is as a kept child of a parent
 * that changes zone ([W-28]), so such children are diffed too. Null diffs every entity.
 */
export function diffBoards(prev: Board, next: Board, changed: ReadonlySet<string> | null = null): SwuRecord[] {
    if (changed === null) {
        return diffWithMiddleBoard(prev, next);
    }
    const ids = changedIds(prev, next, changed);
    if (ids.size === 0) {
        return []; // every entity is the same object in both boards
    }
    return diffWithMiddleBoard(subBoard(prev, ids), subBoard(next, ids));
}

function diffWithMiddleBoard(prev: Board, next: Board): SwuRecord[] {
    try {
        return diff(prev, next);
    } catch (error) {
        if (!(error instanceof SwuPgnError) || error.code !== 'unreachable-board') {
            throw error;
        }
        const middle = middleBoard(prev, next);
        if (middle === null) {
            throw error;
        }
        return [...diff(prev, middle), ...diff(middle, next)];
    }
}

/** The ids of `changed` that are not the same object in both boards, with the children of any of them that changes zone. */
function changedIds(prev: Board, next: Board, changed: ReadonlySet<string>): Set<string> {
    const ids = new Set<string>();
    let parentMayMove = false;
    for (const id of changed) {
        const before = prev.entities[id];
        const after = next.entities[id];
        if (before === after) {
            continue;
        }
        ids.add(id);
        if (before !== undefined && after !== undefined && before.zone !== after.zone) {
            parentMayMove = true;
        }
    }
    if (parentMayMove) {
        for (const id in next.entities) {
            const parent = next.entities[id].parent;
            if (parent === undefined || ids.has(id)) {
                continue;
            }
            const key = String(parent);
            const before = prev.entities[key];
            const after = next.entities[key];
            if (ids.has(key) && before !== undefined && after !== undefined && before.zone !== after.zone) {
                ids.add(id);
            }
        }
    }
    return ids;
}

function subBoard(board: Board, ids: ReadonlySet<string>): Board {
    const entities: Record<string, Entity> = {};
    for (const id of ids) {
        const entity = board.entities[id];
        if (entity !== undefined) {
            entities[id] = entity;
        }
    }
    return { seq: board.seq, entities };
}

/** `next` with the children of every parent that changes zone detached (when kept) or left out (when new); null when there is none. */
function middleBoard(prev: Board, next: Board): Board | null {
    const entities: Record<string, Entity> = { ...next.entities };
    let changed = false;
    for (const [id, entity] of Object.entries(next.entities)) {
        if (entity.parent === undefined || entity.rel === 'captured') {
            continue;
        }
        const parent = String(entity.parent);
        const before = prev.entities[parent];
        const after = next.entities[parent];
        if (before === undefined || after === undefined || before.zone === after.zone) {
            continue;
        }

        const old = prev.entities[id];
        if (old === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete entities[id];
        } else if (old.parent === entity.parent) {
            const detached: Entity = { ...old };
            delete detached.parent;
            delete detached.rel;
            entities[id] = detached;
        } else {
            continue; // a new parent: the diff already attaches it after the parent moves
        }
        changed = true;
    }
    return changed ? { seq: next.seq, entities } : null;
}

/** Deep equality of JSON-shaped values; key order does not matter. */
export function sameValue(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
    }
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every((key) => key in right && sameValue(left[key], right[key]));
}
